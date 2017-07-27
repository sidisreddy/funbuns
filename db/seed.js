'use strict'

const db = require('APP/db')
    , {User, Product, Order, Review, Promise} = db
    , {mapValues} = require('lodash')

function seedEverything() {
  const seeded = {
    users: users(),
    products: products(),
  }

  seeded.favorites = favorites(seeded)

  return Promise.props(seeded)
}

const users = seed(User, {
  sid: {
    email: 'sid@funbuns.com',
    first_name: 'Sid',
    last_name: 'Reddy',
    password: '1234',
  },
  anthony: {
    email: 'anthony@funbuns.com',
    first_name: 'Anthony',
    last_name: 'Watson',
    password: '1234',
  },
  calvin: {
    email: 'calvin@funbuns.com',
    first_name: 'Calvin',
    last_name: 'Lin',
    password: '1234',
  },
  shaun: {
    email: 'shaun@funbuns.com',
    first_name: 'Shaun',
    last_name: 'Elabdouni',
    password: '1234'}
})

// const things = seed(Thing, {
//   surfing: {name: 'surfing'},
//   smiting: {name: 'smiting'},
//   puppies: {name: 'puppies'},
// })


const products = seed(Product, {

  product1: {
    name: 'samurai classic',
    gender: 'M',
    color: 'jet black',
    style: 'samurai classic',
    price: '9.99',
    length: 'short'

  },
  product2: {
    name: 'princess leia',
    gender: 'M',
    color: 'bear brown',
    style: 'princess leia',
    price: '9.99',
    length: 'long'

  },
  product3: {
    name: 'minimane',
    gender: 'F',
    color: 'dirty blonde',
    style: 'minimane',
    price: '9.99',
    length: 'long'

  },
  product4: {
    name: 'dread bun',
    gender: 'M',
    color: 'jet black',
    style: 'dread bun',
    price: '9.99',
    length: 'short'

  },
  product5: {
    name: 'samurai classic',
    gender: 'F',
    color: 'bare blonde',
    style: 'samurai classic',
    price: '9.99',
    length: 'short'
  }
})



const orders = seed(Order, {
  order1: {
    paid: true,
    status: 'open',
    tracking_number: '5043504385094385049843'
  },
  order2: {
    paid: false,
    status: 'open',
    tracking_number: '09394058904385049340580'
  },
  order3: {
    paid: false,
    status: 'cart',
    tracking_number: '98435908349866950984590'
  },
  order4: {
    paid: true,
    status: 'open',
    tracking_number: '90485908349058340958093'
  }
  })


const reviews = seed(Review, {

  product1: {
    rating: 5.0,
    text: 'this shit is fly as fuck'

  },
    product2: {
    rating: 4.8,
    text: 'so cost effective and cool'

  }
  ,
    product3: {
    rating: 2.0,
    text: 'people hate me when i wear this'

  }
   ,
    product4: {
    rating: 3.0,
    text: 'thought i would look cooler'

  },
  product5: {
    rating: 2.5,
    text: 'a bird took a shit on my head'

  }
})

const favorites = seed(Favorite,
  // We're specifying a function here, rather than just a rows object.
  // Using a function lets us receive the previously-seeded rows (the seed
  // function does this wiring for us).
  //
  // This lets us reference previously-created rows in order to create the join
  // rows. We can reference them by the names we used above (which is why we used
  // Objects above, rather than just arrays).
  ({users, orders, reviews, products}) => ({
    // The easiest way to seed associations seems to be to just create rows
    // in the join table.
    'dataset1': {
      user_id: users.barack.id,    // users.barack is an instance of the User model
                                   // that we created in the user seed above.
                                   // The seed function wires the promises so that it'll
                                   // have been created already.
      thing_id: things.surfing.id  // Same thing for things.
    },
    'god is into smiting': {
      user_id: users.god.id,
      thing_id: things.smiting.id
    },
    'obama loves puppies': {
      user_id: users.barack.id,
      thing_id: things.puppies.id
    },
    'god loves puppies': {
      user_id: users.god.id,
      thing_id: things.puppies.id
    },
  })
)

if (module === require.main) {
  db.didSync
    .then(() => db.sync({force: true}))
    .then(seedEverything)
    .finally(() => process.exit(0))
}

class BadRow extends Error {
  constructor(key, row, error) {
    super(error)
    this.cause = error
    this.row = row
    this.key = key
  }

  toString() {
    return `[${this.key}] ${this.cause} while creating ${JSON.stringify(this.row, 0, 2)}`
  }
}

// seed(Model: Sequelize.Model, rows: Function|Object) ->
//   (others?: {...Function|Object}) -> Promise<Seeded>
//
// Takes a model and either an Object describing rows to insert,
// or a function that when called, returns rows to insert. returns
// a function that will seed the DB when called and resolve with
// a Promise of the object of all seeded rows.
//
// The function form can be used to initialize rows that reference
// other models.
function seed(Model, rows) {
  return (others={}) => {
    if (typeof rows === 'function') {
      rows = Promise.props(
        mapValues(others,
          other =>
            // Is other a function? If so, call it. Otherwise, leave it alone.
            typeof other === 'function' ? other() : other)
      ).then(rows)
    }

    return Promise.resolve(rows)
      .then(rows => Promise.props(
        Object.keys(rows)
          .map(key => {
            const row = rows[key]
            return {
              key,
              value: Promise.props(row)
                .then(row => Model.create(row)
                  .catch(error => { throw new BadRow(key, row, error) })
                )
            }
          }).reduce(
            (all, one) => Object.assign({}, all, {[one.key]: one.value}),
            {}
          )
        )
      )
      .then(seeded => {
        console.log(`Seeded ${Object.keys(seeded).length} ${Model.name} OK`)
        return seeded
      }).catch(error => {
        console.error(`Error seeding ${Model.name}: ${error} \n${error.stack}`)
      })
  }
}

module.exports = Object.assign(seed, {users, things, favorites})
