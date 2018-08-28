/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const mongoose = require('mongoose');

const db = mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true} );

const Schema = mongoose.Schema;
const IssueSchema = new Schema({
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: String,
  status_text: String,
  created_on: String,
  updated_on: String,
  open: Boolean
});

const Issue = mongoose.model('Issue', IssueSchema);

module.exports = (app) => {

  app.route('/api/issues/:project')
  
    .get((req, res) => { // probably not what's intended, maybe apitest is an example without api/issues for some reason?
      const project = req.params.project;
      Issue.findOne({_id: project}, (err, data) => {
        if (err) {
          console.log('Error retrieving data', err);
        }
        
        res.send(data);
      });
    })
    
    .post((req, res) => {
      const project = req.params.project; // not necessary?
      const issueCreated = new Date();
      const newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        created_on: issueCreated,
        updated_on: issueCreated,
        open: true,
      });
      newIssue.save((err, data) => {
        if (err) {
          console.log('Error saving to db', err);
        }
      });
      res.send(newIssue);
      return newIssue;
    })
    
    .put((req, res) => {
      const project = req.params.project;
      let updateStatus = 'successfully updated';
      const updates = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text
      };
      // remove the elements the user left blank
      Object.keys(updates).forEach(i => (updates[i] === '') && delete updates[i]);
      if (Object.keys(updates).length === 0) {
        updateStatus = 'no updated field sent';
      }
      const updatedIssue = Issue.findOneAndUpdate({ _id: req.body._id }, updates, {new: true}, (err, data) => {
        if (err) {
          console.log('Error updating', err);
        }
        
        return data;
      });
      
      res.send(updateStatus);
      return updateStatus;
    })
    
    .delete((req, res) => {
      const project = req.params.project;
      let deleteStatus = 'deleted ' + req.body._id;
      
      Issue.findOneAndDelete({ _id: req.body._id }, (err, data) => {
        if (data === null) {
          console.log('dur');
          deleteStatus = 'could not delete ' + req.body._id;
        } else {
          console.log(data);
        }
        if (err) {
          console.log(err);
        }
        res.send(deleteStatus);
        return deleteStatus;
      });
    });
};
