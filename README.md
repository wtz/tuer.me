tuer.me
=======

安装说明：
  
  1,npm安装 npm install tuer

  2,安装好后，进入tuer目录，npm test 查看环境变量和wiki地址帮助说明.

  3,根据test提示，进行本地环境配置，网站的所有配置信息都在./lib/config.js 里，端口以及host请自行修改.

  4,初始化mongodb数据 命令为: mongo host:port/dbname ./model/init.js 执行命令进行数据库初始化,其中host，port，dbname都要和config.js里的匹配.

  5,npm start 就可以直接运行tuer网站.

  PS:数据库开始为空，注册需要依赖本地的sendMail，如果本机不安装sendMail，则注册，找回密码，删回复等功能会报错.

  默认会有一个测试账户，在init.js中被添加 用户名admintest@tuer.me 密码1234qwer

````js
  //如果引用模块自己启动，整个模块目前只有一个start方法.
  //代码如下

  var tuer = require('tuer'),
  tuer.start();
````

  如果有安装问题欢迎邮件联系:designsor@gmail.com 或者去tuer.me 网站留言给我
