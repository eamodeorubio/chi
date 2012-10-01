"use strict";

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg:'<json:package.json>',
    mocha:{
      all:{
        src:'test/**/*.js',
        options:{
          reporter:'tap'
        }
      },
      watch:{
        src:'test/**/*.js',
        options:{
          reporter:'spec'
        }
      }
    },
    lint:{
      src:['grunt.js', 'lib/**/*.js'],
      tests:'test/**/*.js'
    },
    watch:{
      files:['grunt.js', 'lib/**/*.js', 'test/**/*.js'],
      tasks:'lint mocha:watch'
    },
    jshint:{
      options:{
        bitwise:true,
        camelcase:true,
        curly:false,
        eqeqeq:true,
        forin:true,
        immed:true,
        indent:2,
        latedef:true,
        newcap:true,
        noarg:true,
        nonew:true,
        plusplus:false,
        undef:true,
        unused:true,
        strict:true,
        trailing:true,
        maxparams:3,
        maxdepth:2,
        maxstatements: 10,
        maxcomplexity:5,
        globalstrict:true, // not really global since they are inside commonjs modules
        laxcomma:true,
        node:true
      },
      globals:{
        exports:true
      },
      tests:{
        globals:{
          describe:true,
          it:true,
          beforeEach:true,
          afterEach:true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-simple-mocha');

  // Default task.
  grunt.registerTask('default', 'lint mocha:all');
};