const express = require('express');
const router = express.Router();
const controller = require('./apiController');
const validator = require('./validators');

//GET THE BALANCE OF THE ACCOUNT FORMAT ---> http://localhost:27017/api/balance?account=test
router.get('/balance', controller.balance);

/*Deposit Some Amount first -----> 
-----FORMAT-----
{
  "amount":400,
  "banknotes": [
    {
      "amount": 100,
      "value": 4
    }
  ],
  "targetAccount": "test"
}
All fields are mandatory
*/
router.post('/deposit', validator.deposit, controller.deposit);


/*----- FORMAT
{
  "amount": 200,
  "account": "test"
} 
Pass denomination where required as a key
*/
router.post('/withdraw', validator.withdraw, controller.withdraw);

module.exports = router;