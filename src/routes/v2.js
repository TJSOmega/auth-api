'use strict';


const fs = require('fs')
const express = require('express')

const Collection = require('../models/data-collection.js')
const bearerAuth = require('../auth/middleware/bearer.js')
const restrict = require('../auth/middleware/acl.js');
const aclRouter = express.Router();

const models = new Map();

aclRouter.param('model', (req, res, next) =>{
  const modelName = req.params.model;
  if(models.has(modelName)) {
    req.model = models.get(modelName);
    next();
  } else {
    const fileName = `${__dirname}/../models/${modelName}/models.js`;
    if (fs.existsSync(fileName)) {
      const model = require(fileName)
      models.set(modelName, new Collection(model))
      req.model = models.get(modelName)
      next()
    } else {
      next('Invalid model parameter')
    }
  }
})


aclRouter.use(bearerAuth)


aclRouter.get('/:model', handleGetAll);
aclRouter.get('/:model/:id', handleGetOne);
aclRouter.post('/:model', restrict('create'), handleCreate)
aclRouter.put('/:model/:id', restrict('update'), handleUpdate);
aclRouter.delete('/:model/:id', restrict('delete'), handleDelete);

async function handleGetAll(req, res) {
  let allRecords = await req.model.get();
  res.status(200).json(allRecords);
}

async function handleGetOne(req, res) {
  const id = req.params.id;
  let theRecord = await req.model.get(id)
  res.status(200).json(theRecord);
}

async function handleCreate(req, res) {
  let obj = req.body;
  let newRecord = await req.model.create(obj);
  res.status(201).json(newRecord);
}

async function handleUpdate(req, res) {
  const id = req.params.id;
  const obj = req.body;
  let updatedRecord = await req.model.update(id, obj)
  res.status(200).json(updatedRecord);
}

async function handleDelete(req, res) {
  let id = req.params.id;
  let deletedRecord = await req.model.delete(id);
  res.status(200).json(deletedRecord)};



