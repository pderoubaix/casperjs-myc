/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
      clean: ["screenshoots"],
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
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.registerTask('casper', ['clean', 'casperjs']);



};
