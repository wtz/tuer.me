## Tuer API 说明文档

* Tuer API 依赖restify搭建，提供rest格式的API访问接口，API访问限制在1分钟内最多访问30次。
  
  * 一种不需要授权访问的公共API，必须使用appkey才可以访问。
  * 一种必须使用用户授权token方式获取。
  
  > 用户授权方式的API访问，必须在get参数中传递授权token，或者在http header中使用Authorization方式验证。
  
  > token的有效期默认为7天，过期后需要重新引导用户进行授权,也可以在应用中每次登陆都访问刷新token的API保持一直登陆状态。

### 申请APPKEY

* APPKEY申请步骤:

  * 必须为兔耳网站注册用户,才允许申请。[申请地址](http://www.tuer.me/api/apply)
  * 一个账户只能申请一个APPKEY，之后需要等待审核，审核成功后会邮件通知开发者。
  * 开发者可以通过[账户设置](http://www.tuer.me/set)->[APPKEY管理](http://www.tuer.me/api/edit)，查看自己的APPKEY申请情况和进度. 
  * 申请完成并通过审核后，会发放一个APPKEY和一个sercet值，之后用于获取API权限和用户授权。
     
### 用户授权过程
  
* 引导用户访问 <em>http://tuer.me/oauth/authorize?client_id=appkey&redirect_uri=callback_url</em> 进行登陆授权。
* 用户登陆兔耳帐号，之后带到相应app的授权页面。
* 允许授权后，网站会带着一个code值如<em>http://myapp.foo/?code=xxxx</em>跳到你的redirect_uri填写地址，此地址必须要和申请appkey时一致。
* 阻止授权后会跳转到 <em>http://myapp.foo/?error=access_denied</em> 地址，需要开发者自己处理。
* 当用户允许授权并回传给应用code值时，应用程序应该把code值，通过post的方式来兔耳换取token值。
  
  * post需要传递的几个值为如下 
  
  > client_id:'appkey的值'  
  > client_secret:'appkey对应的secret值',  
  > redirect_url:'申请appkey时所写的回调地址',  
  > grant_type:'authorization_code', //固定写死  
  > code:code //回传给你的code值  

* 此时会在兔耳这个授权用户下创建应用和该用户关联的token，这个token会在post的返回结果中附带，类似如下:
  
  > {access_token:"xxxxx",tuer_uid:"user_id"} // tuer_uid为此用户id

* 授权结束，这个时候就可以带着这个token值访问到该id的授权API，如果token过期则需要重新引导授权，默认为7天有效期。
* 如果想一直保持登陆状态，则可以使用token值通过访问刷新token值接口，重新获取token和增长有效期，详细见API列表。

### API列表

* 用户相关
  * 获取用户个人信息
  * 获取用户关注信息
  * 修改用户个人信息
  * 关注用户
  * 取消关注用户
  * 获取兔耳活跃用户
  * 获取兔耳最新用户
* Feed相关
  * 获取最新Feed信息
  * 获取某用户Feed信息
* 日记相关
  * 获取一条日记详细信息
  * 修改日记信息
  * 删除日记
  * 写新日记
  * 获取用户所有公开日记列表
  * 获取用户日记本下所有公开日记列表
  * 获取全站最新日记列表
  * 获取关注的人的日记列表
* 评论相关
  * 获取一条日记的评论信息
  * 写评论,回复评论
  * 删除评论
* 日记本相关
  * 获取用户所有日记本列表
  * 新增日记本
  * 修改日记本
  * 删除日记本
* Todo相关
  * 获取用户todo列表
  * 修改todo信息
  * 新增一条todo
  * 删除一条todo
  
### 错误信息查询
