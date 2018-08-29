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
const ProjectSchema = new Schema({
  name: String,
  issues: [{type: IssueSchema, default: []}]
});
// We need to be able to create a new project if posting an issue to a new project
ProjectSchema.statics.findOneOrCreate = function(condition, callback) {
  const self = this;
  self.findOne(condition, (err, result) => {
    return result ? callback(err, result) : self.create(condition, (err, result) => { callback(err, result) })
  });
}

const Issue = mongoose.model('Issue', IssueSchema);
const Project = mongoose.model('Project', ProjectSchema);

module.exports = (app) => {
  
  app.route('/api/issues/:project')
  
    .get((req, res) => {
      const project = req.params.project;
      const query = req.query;
      const queries = new Object;
      let separatedQueries;
      if (Object.values(query)[0] === '') {
        if (Object.keys(query)[0] !== '0') {
          separatedQueries = JSON.parse(Object.keys(query));
        } else {
          separatedQueries = 0;
        }
      } else {
        if (Object.keys(query).length === 0) {
          separatedQueries = 0;
        } else {
          separatedQueries = query;
        }
      }
      if (separatedQueries !== 0) {
        Object.keys(separatedQueries).forEach((key) => queries[key] = separatedQueries[key]);
      }
      Project.find({name: project}, (err, data) => {
        if (err) {
          console.log('Error retrieving data', err);
        }
        
        res.send(data[0].issues.filter((issue) => {
          let issueShouldFilter = true;
          Object.keys(queries).forEach((key) => {
            if (issue[key].toString() !== queries[key]) {
              issueShouldFilter = false;
            }
          });
          return issueShouldFilter;
        }));
      });
    })
    
    .post((req, res) => {
      const project = req.params.project;
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
      
      Project.findOneOrCreate({name: project}, (err, data) => {
        if (err) {
          console.log(err);
        }
        data.issues.push(newIssue);
        data.save((err) => {
          if (err) {
            console.log('Error saving to database', err);
          }
        });
      });
    
      res.send(newIssue);
    })
    
    .put((req, res) => {
      const project = req.params.project;
      let updateStatus = 'successfully updated';
      const updates = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        open: req.body.open
      };
      // remove the elements the user left blank
      Object.keys(updates).forEach(i => (updates[i] === '' || updates[i] === undefined) && delete updates[i]);
      if (Object.keys(updates).length === 0) {
        updateStatus = 'no updated field sent';
      } else {
        const updatedIssue = Project.findOne({name: project}, (err, data) => {
          if (err) {
            console.log('Error updating ', err);
          }
          if (data === null) {
            updateStatus = 'could not update ' + req.body._id;
          } else {
            const issues = data.issues;
            let updateIndex = -1;
            for (let i=0; i < issues.length; i++) {
              if (issues[i]._id.toString() === req.body._id) {
                updateIndex = i;
              }
            }
            if (updateIndex === -1) {
              updateStatus = 'could not update ' + req.body._id;
            } else {
              for (let key in updates) {
                if (updates.hasOwnProperty(key)) {
                  issues[updateIndex][key] = updates[key];
                }
              }
              data.save((err) => {
                if (err) {
                  console.log('Error updating ', err);
                }
              });
            }
          }
        });
      }
      
      res.send(updateStatus);
    })
    
    .delete((req, res) => {
      const project = req.params.project;
      let deleteStatus = 'deleted ' + req.body._id;
      
      Project.findOne({name: project}, (err, data) => {
        if (data === null) {
          deleteStatus = 'could not delete ' + req.body._id;
        } else {
          const issues = data.issues;
          let issueIndex = -1;
          for (let i=0; i < issues.length; i++) {
            if (issues[i]._id.toString() === req.body._id) {
              issueIndex = i;
            }
          }
          if (issueIndex === -1) {
            deleteStatus = 'could not delete ' + req.body._id;
          } else {
            data.issues = issues.slice(0,issueIndex).concat(issues.slice(issueIndex+1, issues.length));
          }
          data.save((err) => {
            if (err) {
              console.log(err);
            }
          });
        }
        if (err) {
          console.log(err);
        }
        res.send(deleteStatus);
      });
    });
};