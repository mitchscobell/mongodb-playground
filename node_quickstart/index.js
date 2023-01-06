const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const username = "myUserAdmin";
const password = "password";
const clusterUrl = "127.0.0.1";
const portNumber = "27017";
const retryWrites = true;
const uri =
    `mongodb://${username}:${password}@${clusterUrl}:${portNumber}?retryWrites=${retryWrites}&w=majority`;
const client = new MongoClient(uri);

async function run() {

    try {

        await seedDatabase();

        const database = client.db('sample_mflix');
        const movies = database.collection('movies');

        // Query for a movie that has the title 'Back to the Future'
        const singleMovieQuery = { title: 'Back to the Future' };
        const multipleMovieQuery = { title: { $regex: "Back to the Future" } }
        const foundMovie = await movies.findOne(singleMovieQuery);
        const options = {
            // sort returned documents in ascending order by title (A->Z)
            sort: { title: 1 },
            // Include only the `title` and `imdb` fields in each returned document
            projection: { _id: 0, title: 1 },
        };
        const cursor = movies.find(multipleMovieQuery, options);

        // print a message if no documents were found
        if ((await cursor.count()) === 0) {
            console.log("No documents found!");
        } else {
            // replace console.dir with your callback to access individual elements
            await cursor.forEach(console.dir);
        }

        console.log(foundMovie);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
async function seedDatabase() {

    const movie1 =
    {
        title: 'Back to the Future',
        description: 'Marty McFly, a 17-year-old high school student, is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his close friend, the maverick scientist Doc Brown.'
    }

    const listOfMovies = [
        {
            title: 'Back to the Future Part III',
            description: 'Stranded in 1955, Marty McFly learns about the death of Doc Brown in 1885 and must travel back in time to save him. With no fuel readily available for the DeLorean, the two must figure how to escape the Old West before Emmett is murdered.'
        },
        {
            title: 'Back to the Future Part II',
            description: 'After visiting 2015, Marty McFly must repeat his visit to 1955 to prevent disastrous changes to 1985...without interfering with his first trip.'
        }
    ]

    const database = client.db('sample_mflix');
    const collections = await (await database.listCollections().toArray()).map(collection => collection.name);

    if (collections.includes("movies")) {
        console.log('Dropping database: ' + await database.collection('movies').drop());
        await database.createCollection('movies');
    }

    const movies = database.collection('movies');

    movies.insertOne(movie1);
    movies.insertMany(listOfMovies);
}

run().catch(console.dir);