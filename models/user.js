/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const moment = require('moment')
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {
  /** formatter for dates */
  static getformattedDate(timestamp) {
    if (timestamp === null){
      return null;
    }
    return new Date(moment(timestamp).format('MMMM Do YYYY, h:mm a'));
  }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)

    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
            VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
            RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    )
   
    const user = result.rows[0];
     
    // check that this works....
    if (user){
      if (await bcrypt.compare(password, user.password) === true){
        return true;
      }
    }

    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const timeStamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const result = await db.query(
     `UPDATE users
      SET last_login_at = $1
      WHERE username =$2
      RETURNING username, last_login_at`,
      [timeStamp, username]
    )  

    //console.log(timeStamp)
    // do we need to check if the user exitst??
    // if(result.rowCount() === 0) 
  }


  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users
      `
    )
    return results.rows;
  }
   

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username=$1`,
      [username]
    )

    // TESTING SOME FORMATTING
    // let test = {
    //   username: result.rows[0].username,
    //   first_name: result.rows[0].first_name,
    //   last_name: result.rows[0].last_name,
    //   phone: result.rows[0].phone,
    //   join_at: User.getformattedDate(result.rows[0].join_at),
    //   last_login_at: User.getformattedDate(result.rows[0].last_login_at)
    // };
    //console.log("testing formatting: ", test);

    //return test;
    return result.rows[0]
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

   // QUESTION: return messages from this user has an entry called to_user??? is that supposed to be from_user????
  static async messagesFrom(username) { 
    const results = await db.query(
      `SELECT m.id,
        m.body,
        m.sent_at,
        m.read_at,
        u.username,
        u.first_name,
        u.last_name,
        u.phone
      FROM messages m
      JOIN users u
      ON m.to_username = u.username
      WHERE m.from_username = $1`,
      [username]
    )

    let output = results.rows.map(function(e) {
      return {
        id : e.id,
        to_user : {
          username : e.username,
          first_name : e.first_name,
          last_name : e.last_name,
          phone : e.phone
        },
        body : e.body,
        sent_at : User.getformattedDate(e.sent_at),
        read_at : User.getformattedDate(e.read_at) 
      }
    });

    return output;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const results = await db.query(
      `SELECT m.id,
        m.body,
        m.sent_at,
        m.read_at,
        u.username,
        u.first_name,
        u.last_name,
        u.phone
      FROM messages m
      JOIN users u
      ON m.from_username = u.username
      WHERE m.to_username = $1`,
      [username]
    )

    let output = results.rows.map(function(e) {
      return {
        id : e.id,
        from_user : {
          username : e.username,
          first_name : e.first_name,
          last_name : e.last_name,
          phone : e.phone
        },
        body : e.body,
        sent_at : User.getformattedDate(e.sent_at),
        read_at : User.getformattedDate(e.read_at)
      }
    });

    return output;
  }
}


module.exports = User;


