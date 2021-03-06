/** @format */

import express from "express";
import { Group, GroupMember } from "../models/IceBreaker";
import { getClient } from "../db";
import { ObjectId } from "mongodb";

const routes = express.Router();

routes.get("/groups", async (req, res) => {
  try {
    const client = await getClient();
    console.log(client.db().databaseName);
    const results = await client
      .db()
      .collection<Group>("groups")
      .find()
      .toArray();
    res.json(results);
  } catch (err) {
    console.error("ERROR", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
routes.get("/groups/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Group>("groups")
      .findOne({ _id: new ObjectId(id) });
    if (result) {
      res.json(result);
    } else {
      res.status(404).send({ message: "Not Found" });
    }
  } catch (err) {
    console.error("ERROR", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

routes.get("/group-members", async (req, res) => {
  const groupId: string = req.query.groupId as string;
  const userUid: string = req.query.userUid as string;
  let query: any = {}; // What does this do?

  if (groupId) {
    query = { groupId: groupId };
  }
  if (userUid) {
    query = { userUid: userUid };
  }

  try {
    const client = await getClient();
    const results = await client
      .db()
      .collection<GroupMember>("groupmembers")
      .find(query)
      .toArray();
    res.json(results);
  } catch (err) {
    console.error("ERROR", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

routes.post("/groups", async (req, res) => {
  const newGroup: Group = req.body;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Group>("groups")
      .insertOne(newGroup);
    newGroup._id = result.insertedId;
    res.status(201);
    res.json(newGroup);
  } catch (err) {
    console.error("ERROR", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

routes.post("/group-members", async (req, res) => {
  const newMember: GroupMember = req.body;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<GroupMember>("groupmembers")
      .insertOne(newMember);
    newMember._id = result.insertedId;
    res.status(201);
    res.json(newMember);
  } catch (err) {
    console.error("ERROR", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

routes.put("/groups/:id", async (req, res) => {
  const id = req.params.id;
  const group = req.body as Group;
  delete group._id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Group>("groups")
      .replaceOne({ _id: new ObjectId(id) }, group);
    if (result.modifiedCount === 0) {
      res.status(404).json({ message: "Not Found" });
    } else {
      group._id = new ObjectId(id);
      res.json(group);
    }
  } catch (err) {
    console.error("FAIL", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

routes.put("/group-members/:id", async (req, res) => {
  const id = req.params.id;
  const groupMember = req.body as GroupMember;
  delete groupMember._id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<GroupMember>("groupmembers")
      .replaceOne({ _id: new ObjectId(id) }, groupMember);
    if (result.modifiedCount === 0) {
      res.status(404).json({ message: "Not Found" });
    } else {
      groupMember._id = new ObjectId(id);
      res.json(groupMember);
    }
  } catch (err) {
    console.error("FAIL", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default routes;
