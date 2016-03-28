var assert = require('assert');
var ACL = require('../../lib');
var acl;
var options = require('../example-config.js');

describe('we-core-acl:wejs', function () {
  before(function (done){
    acl = new ACL();

    acl.init(options,done);
  });

  describe('canMiddleware', function() {
    it('acl.canMiddleware should callback if permissions not is set', function (done) {
      var req = {
        acl: acl,
        userRolesIsLoad: true,
        userRoleNames: ['unAuthenticated']
      }

      acl.canMiddleware(req, {
        locals: {},
        forbidden: function(err) {
          throw err;
        }
      }, function (err) {
        if (err) throw(err);

        assert(true, 'should run then callback')
        done();
      });
    });

    it('acl.canMiddleware should check access if permission is set', function (done) {
      var req = {
        acl: acl,
        userRolesIsLoad: true,
        userRoleNames: ['authenticated']
      }

      acl.canMiddleware(req, {
        locals: { permission: 'access_admin' },
        forbidden: function(err) {
          throw err;
        }
      }, function (err) {
        if (err) throw(err);

        assert(true, 'should run then callback')
        done();
      });
    });

    it('acl.canMiddleware should skip if acl.app.config.acl.disabled is true', function (done) {
      acl.app.config.acl.disabled = true;

      var req = {
        acl: acl,
        userRolesIsLoad: true,
        userRoleNames: ['authenticated']
      }

      acl.canMiddleware(req, {
        locals: { permission: 'access_admin' },
        forbidden: function(err) {
          throw err;
        }
      }, function (err) {
        if (err) throw(err);
        assert(true, 'should run then callback');
        acl.app.config.disabled = false;
        done();
      });
    });

    it('acl.canMiddleware should check admin access if res.locals.isAdmin is set', function (done) {

      var req = {
        acl: acl,
        userRolesIsLoad: true,
        userRoleNames: ['authenticated']
      }

      acl.canMiddleware(req, {
        locals: {
          isAdmin: true,
          permission: 'access_admin'
        },
        forbidden: function(err) {
          throw err;
        }
      }, function (err) {
        if (err) throw(err);
        assert(true, 'should run then callback');
        done();
      });
    });
  });

  describe('loadUserContextRoles', function() {
    it('acl.loadUserContextRoles should return req.userRoleNames is roles already are set', function (done) {

      acl.loadUserContextRoles({
        userRolesIsLoad: true,
        userRoleNames: ['unAuthenticated']
      }, {}, function (err, userRoleNames) {
        if (err) throw(err);

        assert.equal(userRoleNames[0], 'unAuthenticated');

        done();

      });
    });

    it('acl.loadUserContextRoles should return [\'unAuthenticated\'] in callback if req.user not is set', function (done) {

      acl.loadUserContextRoles({
        userRoleNames: []
      }, {}, function (err, userRoleNames) {
        if (err) throw(err);

        assert.equal(userRoleNames[0], 'unAuthenticated');

        done();

      });
    });

    it('acl.loadUserContextRoles should SET authenticated role with user', function (done) {
      var req = {
        user: {
          getRoles: function() {
            // fake promisse
            return {
              then: function(cb) {
                cb(['ninja']);
                return {
                  catch: function() {}
                }
              }
            }
          }
        }
      };

      acl.loadUserContextRoles(req, {}, function (err, userRoleNames) {
        if (err) throw(err);

        assert(req.userRolesIsLoad);
        assert(req.userRoleNames);

        assert.equal(userRoleNames[0], 'ninja');
        assert.equal(userRoleNames[1], 'authenticated');

        done();
      });
    });
  });

  describe('setModelDateFieldPermissions', function() {
    it('acl.setModelDateFieldPermissions set create and update field permissions', function (done) {
      acl.setModelDateFieldPermissions({
        db: {
          models: {
            user: {}
          }
        }
      });

      assert(acl.permissions['user-edit-field-createdAt']);
      assert(acl.permissions['user-edit-field-updatedAt']);

      done();
    });
  });
});