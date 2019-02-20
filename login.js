
// Initialize the default app
var config = {
        apiKey: "AIzaSyAgyYQphyv1elMoTTuq-a2SjBn5TNFFdn8",
        authDomain: "chaser-game-lmu.firebaseapp.com",
        databaseURL: "https://chaser-game-lmu.firebaseio.com",
        projectId: "chaser-game-lmu",
        storageBucket: "chaser-game-lmu.appspot.com",
        messagingSenderId: "54697517741"
      };
var defaultApp = firebase.initializeApp(config);

var ui = new firebaseui.auth.AuthUI(firebase.auth());
var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, successUrl) {
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: 'https://whynot1597.github.io/chaser/',
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: '<your-tos-url>',
  // Privacy policy url.
  privacyPolicyUrl: '<your-privacy-policy-url>'
};
ui.start('#firebaseui-auth-container', uiConfig);
