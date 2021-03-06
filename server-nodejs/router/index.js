'use strict';

const zip = require('express-easy-zip'); // 'node-archiver', 'zipstream' or 'easyzip'  may be used instead.
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const path = require('path');

const {
  id2path,
  handleError
} = require('./lib');

module.exports = options => {
  router.use(zip());
  router.use(bodyParser.json());
  let reqPath;

  const connect = (moduleLocation, getArgs) => (req, res, next) => {
    require(moduleLocation)(Object.assign(
      {
        options,
        req,
        res,
        next,
        handleError: handleError({ options, req, res })
      },
      getArgs ? getArgs() : {}
    ));
  };

  router.param('id', function(req, res, next, id) {
    try {
      reqPath = id2path(id);
    } catch (err) {
      return handleError({ options, req, res })(Object.assign(
        err,
        { httpCode: 400 }
      ));
    }

    return next();
  });

  router.route('/api/files/:id/children').
    get(connect('./listChildren', _ => ({ path: reqPath })));

  router.route('/api/files/:id').
    get(connect('./statResource', _ => ({ path: reqPath }))).
    patch(connect('./renameCopyMove', _ => ({ path: reqPath }))).
    delete(connect('./remove', _ => ({ path: reqPath })));

  router.route('/api/files').
    get(connect('./statResource', _ => ({ path: path.sep }))).
    post(connect('./uploadOrCreate'));

  router.route('/api/download').
    get(connect('./download'));

  router.use((err, req, res, next) => handleError({ options, req, res })(err));
  return router;
};
