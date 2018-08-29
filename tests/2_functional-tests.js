/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

const testIssue = {
  issue_title: 'Title',
  issue_text: 'text',
  created_by: 'me',
  assigned_to: 'Chai and Mocha',
  status_text: 'In QA'
};

// we need one piece of stored data saved from the post requests in order to test the put requests and delete requests
let test_id;

suite('Functional Tests', () => {
  
    suite('POST /api/issues/{project} => object with issue data', () => {
      
      test('Every field filled in', (done) => {
       chai.request(server)
         .post('/api/issues/test')
         .send(testIssue)
         .end((err, res) => {
           assert.equal(res.status, 200);
           assert.isObject(res.body);
           assert.property(res.body, 'issue_title');
           assert.property(res.body, 'issue_text');
           assert.property(res.body, 'created_on');
           assert.property(res.body, 'updated_on');
           assert.property(res.body, 'created_by');
           assert.property(res.body, 'assigned_to');
           assert.property(res.body, 'open');
           assert.property(res.body, 'status_text');
           assert.property(res.body, '_id');
           test_id = res.body._id;
           assert.equal(res.body.issue_title, 'Title');
           assert.equal(res.body.issue_text, 'text');
           assert.equal(res.body.created_by, 'me');
           assert.equal(res.body.assigned_to, 'Chai and Mocha');
           assert.equal(res.body.status_text, 'In QA');
           assert.isBoolean(res.body.open);
           assert.equal(res.body.open, true);
          done();
        });
      });
      
      test('Required fields filled in', (done) => {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'me',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'issue_title');
          assert.property(res.body, 'issue_text');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, 'created_by');
          assert.property(res.body, 'open');
          assert.property(res.body, '_id');
          test_id_other = res.body._id;
           assert.equal(res.body.issue_title, 'Title');
           assert.equal(res.body.issue_text, 'text');
           assert.equal(res.body.created_by, 'me');
           assert.isBoolean(res.body.open);
           assert.equal(res.body.open, true);
          done();
        });
      });
      
      test('Missing required fields', (done) => {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'required parameters not send');
          done();
        });
      });
    });
    
    suite('PUT /api/issues/{project} => text', () => {
      
      test('No body', (done) => {
        chai.request(server)
        .put('/api/issues/test')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no updated field sent');
          done();
        });
      });
      
      test('One field to update', (done) => {
        chai.request(server)
        .put('/api/issues/test')
        .send({_id: test_id, issue_title: 'Updated Title'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
      });
      
      test('Multiple fields to update', (done) => {
        chai.request(server)
        .put('/api/issues/test')
        .send({_id: test_id, issue_title: 'Another Updated Title', issue_text: 'Updated text'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          done();
        });
      });
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', () => {
      
      test('No filter', (done) => {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', (done) => {
        chai.request(server)
          .get('/api/issues/test')
          .query({open: true})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', (done) => {
        chai.request(server)
          .get('/api/issues/test')
          .query({open: true, created_by: 'me'})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            done();
        });
      });
    });
    
    suite('DELETE /api/issues/{project} => text', () => {
      
      test('No _id', (done) => {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, '_id error');
            done();
        });
      });
      
      test('Valid _id', (done) => {
        chai.request(server)
          .delete('/api/issues/test')
          .send({_id: test_id})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'deleted ' + test_id);
            done();
        });
      });
    });

});
