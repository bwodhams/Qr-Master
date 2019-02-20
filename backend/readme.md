This is the backend code used by the QRCodes4Good App.

To get started, clone repo, enter the directory and do npm install.
Also need npm install react-native-bcrypt  and npm install bcryptjs

For more explicit instructions, check out the howTo.md file.

Server routes
HOST : http://104.42.36.29:3001

Sample account {"email": "bpwodhams@gmail.com", "password": "1234"}

| Mode | Route | Description | Expected Input | Expected Output | Sample Usage |
| ---- | ----- | ----------- | -------------- | ------------ | -------- |
| GET  |  {HOST}/api/verify/ | Verify a user's email address | Email address and the verification code - these values are automatically included in the email sent to the user, so all they have to do is click the link to verify. | JSON object {"message": "some message"} | /api/verify/:email&:code |
| PUT | {HOST}/api/user/create | Create new account | Body containing email, name, password | JSON object {"message": "some message", "accountCreated": true or false} | /api/create  with request body of {"email": "random@gmail.com", "name": "Random Name", "password": "randomPassword"} |
| POST | {HOST}/api/user/login | Login to account | Body containing email, inputPassword | JSON object {"message": "someMessage", "loggedIn": true or false} | /api/user/login  with request body of {"email": "random@gmail.com", "inputPassword": "randomPassword"} |
| POST | {HOST}/api/user/updateStripe | Update stripe info | Body containing email, creditCard, cvv, billingFirstName, billingLastName, billingAddress, billingCity, billingState, billingZip | JSON object of the user {_id, email, name, passwordHash, emailVerifCode, stripeData[]} | /api/user/updateStripe   with request body of {"email": "random@gmail.com", "creditCard": "123456789", "exp": "02/2019", "cvv": "123", "billingFirstName": "First", "billingLastName": "Last", "billingAddress": "123 Random Street", "billingCity": "Tucson", "billingState": "AZ", "billingZip": "12345"} |
| GET | {HOST}/api/user/getCards/ | Get cards connected to user's account. | Email address | JSON object stripData{}| /api/user/getCards/:random@gmail.com |