const { MongoClient } = require("mongodb");
var ObjectId = require("mongodb").ObjectID;
const { v4: uuidv4 } = require("uuid");

async function connect() {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
  const uri = `mongodb+srv://db_user_read_write:${process.env.DB_PASSWORD}@cluster0.ob8gc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    return client;
  } catch (e) {
    console.error(e);
  }
}

async function createUser(client, email, hashPassword, name) {
  try {
    var db = client.db("algorithmic_trading").collection("users");
    var isExistingUser = await db.findOne({ email: email });
    if (isExistingUser) return "user exists";
    var res = await db.insertOne({
      email: email,
      hashPassword: hashPassword,
      name: name,
    });
  } catch (e) {
    throw e;
  }
}

async function getUserByEmail(client, email) {
  try {
    var db = client.db("algorithmic_trading").collection("users");
    var isExistingUser = await db.findOne({ email: email });
    return isExistingUser;
  } catch (e) {
    throw Error("cannot get user by email");
  }
}

async function createNewSubmission(client, user_id) {
  try {
    var db = client.db("algorithmic_trading").collection("users");
    const submissionId = uuidv4();
    const submissionStr = "submissions." + submissionId;
    console.log(user_id);
    await db.updateOne(
      { _id: ObjectId(user_id) },
      { $set: { [submissionStr]: { cash: 10000, stocks: {}, code: "" } } }
    );
    return submissionId;
  } catch (e) {
    throw Error("Cannot create new submission");
  }
}

async function getCursor(client) {
  try {
    const cursor = client
      .db("algorithmic_trading")
      .collection("users")
      .find({});
    return cursor;
  } catch (e) {
    throw Error("cannot get cursor");
  }
}

async function getSubmissions(client, email) {
  try {
    var db = client.db("algorithmic_trading").collection("users");
    let submissions = await db.findOne(
      { email: email },
      { projection: { submissions: 1 } }
    );
    return submissions;
  } catch (e) {
    console.log(e);
    throw Error("could not find");
  }
}

async function getStandardAndPoors(client) {
    try {
        var db = client.db("algorithmic_trading").collection("users");
        let sAndP = await db.findOne(
            { _id: ObjectId("605c0f15218169964428744b") }
        );
        return sAndP["standardAndPoors"];
    } catch (e) { 
        console.log(e);
        throw Error("Could not get standardAndPoors data");
    }
}

async function setStandardAndPoors(client, value) {
  try {
    var db = client.db("algorithmic_trading").collection("users");
    await db.updateOne(
      { _id: ObjectId("605c0f15218169964428744b") },
      { $set: { standardAndPoors: value } }
    );
  } catch (e) {
    console.log(e);
    throw Error("could not set Standard and Poors in db");
  }
}

module.exports = {
  connect,
  createUser,
  getUserByEmail,
  getCursor,
  createNewSubmission,
  getSubmissions,
  setStandardAndPoors,
  getStandardAndPoors
};
