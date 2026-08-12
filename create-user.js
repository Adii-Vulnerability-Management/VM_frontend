const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MONGO_URL = "mongodb+srv://dev_user:jHXgZqhHNCdIfz39@dev-cluster.3xig7.mongodb.net/GRC_privacy?retryWrites=true&w=majority";

async function run() {
  await mongoose.connect(MONGO_URL);

  const users = mongoose.connection.collection("users");

  const password = await bcrypt.hash("Password@123", 12);

  const user = {
    user_id: Date.now(), // simple unique id
    user_uuid: new mongoose.Types.ObjectId().toString(),

    email: "direct.user@company.com",
    password,

    first_name: "Direct",
    last_name: "User",
    user_name: "Direct User",

    user_designation: "Employee",

    is_active: true,
    is_deleted: false,
    is_staff: false,
    is_superuser: false,

    emailVerified: false,
    mfaEnabled: false,
    afterLoginMfaVerified: null,

    resources: [],

    date_joined: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await users.insertOne(user);

  console.log("User created successfully");
  process.exit();
}

run();
