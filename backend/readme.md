This is the backend code used by the QRCodes4Good App.

To get started, clone repo, enter the directory and do npm install.
Also need npm install react-native-bcrypt  and npm install bcryptjs

For more explicit instructions, check out the howTo.md file.

Server routes
HOST : http://104.42.36.29:3001

| Mode | Route | Description | Expected Input | Sample Usage |
| ---- | ----- | ----------- | -------------- | ------------ |
| GET  |  {HOST}/api/verify/ | Verify a user's email address | Email address and the verification code - these values are automatically included in the email sent to the user, so all they have to do is click the link to verify. | /api/verify/:email&:code |
| PUT | {HOST}/api/user/create | Create new account | Body containing email, name, password | /api/create  with request body of {"email": "random@gmail.com", "name": "Random Name", "password": "randomPassword"} |