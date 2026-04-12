1. install the packages express, mongoose, cors, dotenv
2. create the server file, setup the server
3. create the .env file which has port number and mongoDb connectionString (from Atlas)
4. create config > db.js, which has the connection logic to mongo then call that function inside server file
5. created models > recipe.model, used subschemas also known as embedding schema and we also used referenceSchema

---->>> CRUD OPERATION FOR RECIPES <<<---- 6. creating route for recipe routes > recipeRoutes.js 7. separated the router logic in controllers and endpoints in routes folder 8. Post request to create new recipes 9. Put request to update old recipes 10. delete request to delete any recipes

---->>> Pantry System <<<---------
