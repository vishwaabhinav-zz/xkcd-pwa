importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');

var config = {
    apiKey: "AIzaSyAaiLZt8QjllRnNwXTTExlkSjzULTmDK7Y",
    messagingSenderId: "574431562885"
};
firebase.initializeApp(config);

const messaging = firebase.messaging();
console.log(messaging);

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: 'static/images/large.png'
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});
