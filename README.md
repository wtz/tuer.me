tuer.me
=======

配置说明：
  
  git clone https://github.com/xiaojue/tuer.me.git

  sudo npm install -d把依赖模块全部安装好，或者用root用户，因为有些是需要比较高的权限的

  确认本机有安装redis-server,mongodb,nginx,nginx concat这几个东西并且已经启动.

  nginx的配置如下,本地路径记得自行修改,并把hosts修改,把tuer.me这几个域名指向本地127.0.0.1
  
  ./nginx -s reload 重新加载配置文件，无报错则成功。
  
  配置mongodb，打开model目录，./mongo 127.0.0.1:10001/node-mongo-tuer init.js执行命令进行数据库初始化
  
  请确保mongo在10001端口可访问，也可以根据配置自行修改model/base.js最后一行的ip和端口号

  然后node app.js 看到服务正常启动，访问tuer.me就可以进行调试开发了。

  数据库开始为空，注册需要依赖本地的sendMail，如果本机不安装sendMail，则注册，找回密码，删回复等功能会报错

  可以自行注释相关代码，并在数据库中手动增加用户即可。

  默认会有一个测试账户，在init.js中被添加 用户名admintest@tuer.me 密码1234qwer
