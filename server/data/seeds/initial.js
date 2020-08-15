exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('artist').del()
    .then(function () {
      // Inserts seed entries
      return knex('artist').insert([
        {spotifyId: "3eqjTLE0HfPfh78zjh6TqT", name: "Bruce Springsteen"},
      ]);
    });
};
