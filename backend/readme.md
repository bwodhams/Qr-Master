This is the backend code used by the QRCodes4Good App.

To get started, clone repo, enter the directory and do npm install.
Also need npm install react-native-bcrypt  and npm install bcryptjs

For more explicit instructions, check out the howTo.md file.


Server information (connect via SSH)
====================================
IP : 104.42.36.29

Username : qrcodes4good

Password : 1282*^nb7*(56&


Once logged in, all pertinent information can  be found at route 
/app/

Using [SCREEN](https://linux.die.net/man/1/screen) to allow app to run without needing to stay connected to server. 

Frequently used commands
------------------------
| Command | Description |
| ------- | ----------- |
| screen -ls | list all currently running screens |
| screen -r 1234 | connect to screen with id number 1234 |
| ctrl + a + d | disconnect from screen (detach) and leave running |

Sample usage to restart node server
-----------------------------------
| Command | Description |
| ------- | ----------- |
| screen -ls | list all currently running screens |
| screen -r 1791 | connect to node screen |
| ctrl + c | stop node service |
| node server/server.js | start node service |
| ctrl + a + d | detach from screen and leave node service running |



Server routes
=============
HOST : http://104.42.36.29:3001

Sample account {"email": "bpwodhams@gmail.com", "password": "Abc1234"}

| Mode | Route | Description | Expected Input | Expected Output | Sample Usage |
| ---- | ----- | ----------- | -------------- | ------------ | -------- |
| GET  |  {HOST}/api/verify/ | Verify a user's email address | Email address and the verification code - these values are automatically included in the email sent to the user, so all they have to do is click the link to verify. | JSON object {"message": "some message"} | /api/verify/:email&:code |
| PUT | {HOST}/api/user/create | Create new account | Body containing email, name, password, confirmPassword | JSON object {"message": "some message", "accountCreated": true or false} | /api/create  with request body of {"email": "random@gmail.com", "name": "Random Name", "password": "randomPassword", "confirmPassword": "randomPassword"} |
| POST | {HOST}/api/user/login | Login to account | Body containing email, inputPassword, loginAuthToken. If normal user/pass signin, send empty loginAuthToken value ("loginAuthToken" : "") | JSON object {"message": "someMessage", "loggedIn": true or false, "loginAuthToken": "1234", "name": "account name"} | /api/user/login  with request body of {"email": "random@gmail.com", "inputPassword": "randomPassword", "loginAuthToken": "1234"} |
| POST | {HOST}/api/user/updateStripe | Update stripe info | Body containing email, creditCard, cvv, billingFirstName, billingLastName, billingAddress, billingCity, billingState, billingZip | JSON object of the user {_id, email, name, passwordHash, emailVerifCode, stripeData[]} | /api/user/updateStripe   with request body of {"email": "random@gmail.com", "creditCard": "123456789", "exp": "02/2019", "cvv": "123", "billingFirstName": "First", "billingLastName": "Last", "billingAddress": "123 Random Street", "billingCity": "Tucson", "billingState": "AZ", "billingZip": "12345"} |
| GET | {HOST}/api/user/getCards/ | Get cards connected to user's account. | Email address | JSON object stripData{}| /api/user/getCards/:random@gmail.com |
| DELETE | {HOST}/api/user/:email | Delete account. | Email address | JSON object of deleted user | /api/user/random@gmail.com |