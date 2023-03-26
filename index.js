
const remindersList = document.getElementById("reminders-list");
const addButton = document.getElementById("add-button");

addButton.addEventListener("click", (event) => {
  event.preventDefault();

  const medicineName = document.getElementById("medicine-name").value;
  const medicineTime = document.getElementById("medicine-time").value;

  if (medicineName.trim() === "" || medicineTime === "") {
    alert("Please enter both medicine name and time to take.");
    return;
  }

  const now = new Date();
  const [hours, minutes] = medicineTime.split(":");
  const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

  const reminder = {
    name: medicineName,
    time: reminderTime,
  };

  localStorage.setItem(reminder.time.getTime(), JSON.stringify(reminder));

  addReminderToUI(reminder);
});

function addReminderToUI(reminder) {
  const li = document.createElement("li");
  li.innerText = `${reminder.name} at ${formatTime(reminder.time)}`;

  remindersList.appendChild(li);

  scheduleNotification(reminder);
}


function scheduleNotification(reminder) {
  if ("Notification" in window && Notification.permission === "granted") {
    console.log("we already won maara");
    const now = new Date();
    const timeDiff = reminder.time.getTime() - now.getTime();

    if (timeDiff <= 0) {
      console.warn(`Reminder ${reminder.name} is already past due.`);
      return;
    }
    
    setTimeout(() => {
      alert("take medicine");
      const options = {
        body: `It's time to take ${reminder.name}`,
        
        
      };

      var notification = new Notification("Medicine Reminder",options);

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
      };
      if ('Notification' in window && navigator.serviceWorker) {
        Notification.requestPermission().then(function(permission) {
          if (permission === 'granted') {
            // User has granted permission to receive notifications
            // Get the current time
            var currentTime = new Date().getTime();
            // Schedule the notification for 10 seconds from now
            var notificationTime = currentTime + 10000;
            // Schedule the notification
            Notification.requestPermission().then(function(permission) {
              if (permission === 'granted') {
                // Schedule the notification with the service worker
                navigator.serviceWorker.ready.then(function(registration) {
                  var options = {
                    body: 'It\'s time to take your ' + medicineName + '!',
                    icon: '/images/notification-icon.png'
                  };
                  registration.showNotification(medicineName + ' Reminder', options);
                  console.log('Notification scheduled.');
                });
              }
            });
          }
        });
      }
      

      notification.onerror = (event) => {
        console.error(`Error displaying notification for reminder ${reminder.name}:`, event);
      };
    }, timeDiff);

    console.log(`Scheduled notification for reminder ${reminder.name} in ${timeDiff} milliseconds.`);
  } else if ("Notification" in window && Notification.permission !== "denied") {
    Notification.requestPermission((permission) => {
      if (permission === "granted") {
        console.log("we won maara");
        alert("teake medicine");
        scheduleNotification(reminder);
      }
      else{
        console.log("we loose maara");
      }
    });
  }
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

window.addEventListener("load", () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const reminder = JSON.parse(localStorage.getItem(key));

    if (reminder.time > new Date()) {
      addReminderToUI(reminder);
    } else {
      localStorage.removeItem(key);
    }
  }
});
