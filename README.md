# Feathers with ng-admin

> PoC of getting ng-admin to work with FeathersJS

- Requires feathers-rest
- Has only be tested with feathers-sequelize yet

## Gettings started
```bash
# Clone this repo

npm install

npm start

# Navigate to http://localhost:8080
```

Adapt `admin.js` to your needs – consult the official ng-admin documentation (it's great stuff) and the Feathers documentation (getting better every day).

Putting the **entities** into separate constants might be far from a „beautiful“ pattern, but does in fact help splitting up the code with plain-old Angular.

And yep, there is no Grunt, Gulp, Webpack or Babel magic required to get this stuff working.

## Known Limitations
- Pagination is broken due to a fake `totalCount` (this could be simple to solve with a Express-Middleware)

## Successfully ~~tested~~ in Production with

### Feathers Modules
```json
{
  "dependencies": {
    "feathers": "2.1.1",
    "feathers-rest": "1.7.1",
    "feathers-sequelize": "1.4.0"
  }
}
```