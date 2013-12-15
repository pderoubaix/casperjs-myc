/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    casperjs: {
          options: {
              async: {
                  parallel: false
              },
              casperjsOptions: ['--username='+grunt.option('username'), '--password='+grunt.option('password')]
          },
          files: ['tests/*.js']
      }
  });


  grunt.loadNpmTasks('grunt-casperjs');




};
