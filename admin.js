
angular.module('feathers', [ 'ng-admin', 'ng-admin.jwt-auth' ])
  .constant('HOST', 'http://localhost:3030')
  .config([ 'ngAdminJWTAuthConfiguratorProvider', 'HOST', function (jwt, HOST) {
    jwt.setJWTAuthURL(HOST + '/auth/local')
    jwt.setCustomLoginTemplate('login.html')
    jwt.setCustomAuthHeader({
      name: 'Authorization',
      template: 'Bearer {{token}}'
    })
  } ])
  .config(['NgAdminConfigurationProvider', 'groupEntity', 'userEntity', 'HOST', function (nga, groupEntity, userEntity, HOST) {
    var admin = nga.application('Feathers Admin').baseApiUrl(HOST + '/')
    admin.addEntity(groupEntity(nga))
    admin.addEntity(userEntity(nga))
    nga.configure(admin)
  } ])
  .config([ 'RestangularProvider', function (rest) {
    rest.addResponseInterceptor(function (data, operation, what, url, response) {
      // this is a stupid workaround ATM and might be quite simple to solve ()
      response.totalCount = 100000
      return data
    })

    rest.addFullRequestInterceptor(function (element, operation, what, url, headers, params) {
      if ('_page' in params && '_perPage' in params) {
        params.$skip = (params._page - 1) * params._perPage
      }
      if ('_perPage' in params) {
        params.$limit = params._perPage
      }

      if ('_filters' in params) {
        _.forEach(params._filters, function (value, key) {
          params[ key ] = value
        })
      }

      if (_.has(params, '_sortField')) {
        params[ '$sort[' + params._sortField + ']' ] = params._sortDir === 'DESC' ? -1 : 1
      }

      delete params._filters
      delete params._page
      delete params._perPage
      delete params._sortField
      delete params._sortDir

      return { params: params }
    })
  } ])
  .constant('groupEntity', function (nga) {
    var group = nga.entity('groups')

    group.updateMethod('patch')
    group.createMethod('post')

    var userField = nga.field('user_id', 'reference')
      .validation({ required: true })
      .targetEntity(nga.entity('users'))
      .targetField(nga.field('email'))
      .label('Admin')
      .pinned(true)

    group.listView().fields([
      nga.field('name').validation({
        required: true,
        maxlength: 15,
        minlength: 4
      }).isDetailLink(true),
      userField
    ]).filters([
      userField,
      nga.field('name').label('Name Search')
    ]).listActions([
      '<ma-edit-button entry="::entry" entity="::entity" size="xs" label="Edit"></ma-edit-button>'
    ])

    var listFields = angular.copy(group.listView().fields())

    listFields.push([
      nga.field('wager', 'text'),
    ])

    var creationFields = angular.copy(listFields)
    group.creationView().fields(creationFields)

    // Edition
    listFields.unshift([ nga.field('id').editable(false) ])
    group.editionView().title('Edit Group: {{ entry.values.name }}').fields(listFields)

    return group
  })
  .constant('userEntity', function (nga) {
    var user = nga.entity('users')

    user.updateMethod('patch')
    user.createMethod('post')

    // List
    user.listView().fields([
      nga.field('id').editable(false),
      nga.field('email', 'email').isDetailLink(true),
      nga.field('created_at', 'datetime').editable(false),
      nga.field('updated_at', 'datetime').editable(false)
    ]).filters([
      nga.field('email', 'email').pinned(true)
    ])

    // Creation
    user.creationView().fields([
      nga.field('email', 'email'),
      nga.field('password', 'password').validation({ required: true })
    ]).title('Create User: {{ entry.values.nickname }}')

    // Edition
    var editionFields = angular.copy(user.listView().fields())
    editionFields.push([
      nga.field('groups', 'referenced_list')
        .label('Group-Admin of')
        .targetEntity(nga.entity('groups'))
        .targetReferenceField('user_id')
        .targetFields([
          nga.field('id').label('ID'),
          nga.field('name').label('Group-Name')
        ])
    ])

    user.editionView().fields(editionFields).title('Edit User: {{ entry.values.nickname }}')

    return user
  })
