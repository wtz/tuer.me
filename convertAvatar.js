var tuerBase = require('./model/base');
var fs = require('fs');
var uuid = require('node-uuid');
var Canvas = require('canvas');
var Image = Canvas.Image;
var defaultAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACO0lEQVR42u2ZaXOCMBCG/f9/TRFw6jHO9LDlEKQqrdyF7S697UwhkEDo+OH9mOR9shuSXUZhGMKQNboA/DcAcx/ByklAtTJQzBfQ7AL0bQGqncPaTeQCOAUh3HgxTK380+jMgT+1dNJybPA+vleAxTYtjVeZ/i4NIXX7LTokHSPVBqQxwM6PmIxXQZmHuFuAlZuCjovz0sLNugOg3SpTgSMAzdcZwLXHd/c7B1hiuAcNsHBeBABAdwBXwwfIuQOQLgB1Nd9iCmHIeUqzoeNDPFQA5xjhS7MQAFDADucWDjClJ/IWhEgxc/EAqg3CAEj+88ABXD8aNsBOPEAhFODpJDiFNMEAwg9xgOUfvRx5G6fbvbOLzD9FsN7x+5wu3bxxXdyqqOcFEAQ9dSXKfg8aaKWGTwhuja37fdrYvO4UZTr23plz/Zg9Gi13nntrkSBYAIxDIhfAEd8wUzRWRwreJawXlnAAMsQCEASSAZChKeZ1Hc2wopOuvV6mUE2AuWwAtPszO6sNMMGKznuK5AAg8xOspOqa/w7B4yC3ArAPEWhWxmz+U0YGD48dXWSuH8LGi0A3UxgbOe560dz4mRSMBs2p4tx3uIbDUNxXAmy8GGbWl2lajJfx3yBQrkFr6RbBxM0BaIIxGaaJe9QYN0wxM3aAcmDP5j9EB54JgAprCqdMuvWSegD0WZzTX0TJABQ8F8fnGgAq/f6Uzfy7xkZRDTAxQVoAUlAFILN5knfW+PoBYB1i6QGu7J+f1FebMjmuZa3kQAAAAABJRU5ErkJggg==";
var defaultUsers = {};

setTimeout(function() {
  tuerBase.getCollection('users', function(err, db) {
    db.find().toArray(function(err, users) {
      users.forEach(function(user) {
        if (defaultAvatar === user.avatar) {
          //默认头像->
          defaultUsers[user.id] = 'default';
        } else {
          var uid = uuid.v1();
          var buf = new Buffer(user.avatar.replace(/^data:image\/\w+;base64,/, ''), 'base64');
          fs.writeFileSync('public/avatar/big/' + uid + '.png', buf);
          var img = new Image;
          img.onload = function() {
            var width = 48;
            var height = 48;
            var canvas = new Canvas(width,height);
            var ctx = canvas.getContext('2d');
            if (user.coords && user.coords !== 'undefined') {
              //被裁切过
              var coords = user.coords.split(',');
              for (var i in coords) {
                coords[i] = coords[i].toString() == 'NaN' ? 0: coords[i];
              }
              ctx.drawImage(img, coords[2], coords[3], coords[0], coords[1], 0, 0, width, height);
            } else {
              //没被裁切过
              ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);
            }
            canvas.toBuffer(function(err, buf) {
              fs.writeFileSync('public/avatar/small/' + uid + '.png', buf);
            });
          };
          img.src = user.avatar;
          defaultUsers[user.id] = uid;
        }
      });
      setTimeout(function(){
        for(var id in defaultUsers){
          db.update({id:parseInt(id,10)},{$set:{avatar:defaultUsers[id]}},function(err,data){
              console.log(data); 
          });
        }
        console.log(defaultUsers);
      },9000);
    });
  });
},
1000);

