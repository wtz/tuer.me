## Tuer API 说明文档

* Tuer API 依赖restify搭建，提供rest格式的API访问接口，API访问限制在1秒钟内最多访问3次。
  
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

  > 通用参数:  
  > callback=abc 返回abc()的jsonp格式数据  
  > count=15 分段分页数,默认为10  
  > page=1 页数,默认为1  

#### 用户相关
* 获取用户个人信息
  
  > http://api.tuer.me/user/info/id  
  > {id:2,nick:"xiaojue",pageurl:"designsor",profile:"new day!",about:""}  
  > 头像地址为两个，可以自己通过id拼取:  
  > http://www.tuer.me/user/avatar/id 小图  
  > http://www.tuer.me/user/art/id 大图  
    
* 获取用户关注信息 
   
  > http://api.tuer.me/user/follow/id [count,page]  
  > {id:2,followers:{data:[],count:100},followed:{data:[],count:10}}

* 修改用户个人信息 <em>授权</em>
  
  > http://api.tuer.me/user/edit/id [nick,profile,about]  
  > 只能修改nick,profile,about这3项，post方法
  > {code:"success",message:""}

* 关注/取消关注用户 <em>授权</em>
  
  > http://api.tuer.me/user/attention/id [addid|removeid]  
  > 参数为addid/removeid  
  > {code:"success",message:"",status:"followed/unfollowed"}

* 获取兔耳活跃用户 
  
  > http://api.tuer.me/user/hots  
  > {hots:[]} //只返回15个，不支持count分页 

* 获取兔耳最新用户

  > http://api.tuer.me/user/news  
  > {news:[]} //只返回15个，不支持count分页

#### Feed相关
* 获取最新Feed信息
  
  > http://api.tuer.me/feed/news [page,count]  
  > {data:[],count:count} data中为feed object  
  > feed_type分为register,todo,diary,notebook类型,具体信息如下  
  > register -> {feed_type:'register',id:id,nick:nick,created_at:created_at}  
  > todo -> {feed_type:'todo',content:content,created_user:created_user,pageurl:pageurl,created_at:created_at}  
  > diary -> {feed_type:'diary',id:id,content:content,bookname:bookname,bookid:bookid,created_user:created_user  
  > ,pageurl:pageurl,privacy:privacy  
  > ,location:location,mood:mood,weather:weather,img:img,created_at:created_at}  
  > privacy如果为1，则content不返回  
  > img 为图片src地址，没有则为空字符串  
  > 其中心情，地点，天气如果没有，则为空字符串  
  > notebook -> {feed_type:'diary',id:id,name:name,created_user:created_user,bgcolor:bgcolor,pageurl:pageurl,created_at:created_at}  
  
#### 日记相关 
  
  > 隐私日记会根据token来返回，如果不带token，则隐私日记不返回内容，如果带token，则视为用户登陆，可返回属于自己的隐私日记。  

* 获取一条日记详细信息
  
  > http://api.tuer.me/diary/info/id  
  > get方法，id为日记id
  > 返回值参见feed中的diary返回值.  
  
* 修改日记信息 <em>授权</em>  
  
  > http://api.tuer.me/diary/edit/id [content,bookid,privacy,forbid,location,mood,weather]  
  > content为日记内容，bookid为日记本id，privacy为是否隐私，forbid是是否可以评论  
  > location为地点，mood为心情，weather为天气，mood和weather为0,1,2,3,4形式掩码  
  > 以上参数至少要有一个
  > {code:'success',message:'修改成功'}  
  
* 删除日记 <em>授权</em>  

  > http://api.tuer.me/diary/del [id]  
  > id为日记id,成功删除后返回  
  > {code:'success',message:'删除成功'}    

* 写新日记 <em>授权</em>  
   
  > http://api.tuer.me/diary/save [content,bookid,privacy,forbid,location,mood,weather] 
  > 所有参数均为必须写入的，暂时api不支持传图  
  > {code:'success',message:'写入日记成功'}  

* 获取用户日记列表  
  
  > http://api.tuer.me/diaries/user/uid [page,count]
  > get方法，uid为获取用户id，支持page和count  
  > {data:[],count:count} data中为日记详细列表，格式同单条日记格式  

* 获取用户日记本日记列表

  > http://api.tuer.me/diaries/notebook/bookid [uid,page,count]  
  > get方法，bookid为日记本id，uid为用户id,支持page和count  
  > {data:[],count:count}    

* 获取全站最新日记列表

  > http://api.tuer.me/diaries/news [page,count]  
  > get方法,支持page和count
  > {data:[],count:count}    
  
* 获取关注的人的日记列表

  > http://api.tuer.me/diaries/follow/uid [page,count]  
  > get方法,uid为获取人id，支持page和count
  > {data:[],count:count} 不返回隐私日记     
  
#### 评论相关  

* 获取一条日记的评论信息

  > http://api.tuer.me/comment/info/id [id,page,count]  
  > {data:[],count:count} //其中的_id，userid均为mongo id  
  
* 写评论,回复评论 <em>授权</em>

  > http://api.tuer.me/comment/save/id [id,content,replyid,replyname]  
  > {code:'success',msg:'回复成功'}  //这里的id，replyid均为mongo id

* 删除评论 <em>授权</em>

  > http://api.tuer.me/comment/del/id [id]  
  > {code:'success',msg:'删除成功'}  //这里的id要传入mongo id


#### 日记本相关  

* 获取用户所有日记本列表  

  > http://api.tuer.me/notebook/user/uid [uid,page,count]  
  > {}  
  
* 新增日记本 <em>授权</em>

  > http://api.tuer.me/notebook/save  [bookname,bgcolor]  
  > {}  

* 修改日记本 <em>授权</em>

  > http://api.tuer.me/notebook/edit/bookid [bookname,bgcolor]  
  > {}  

* 删除日记本 <em>授权</em>

  > http://api.tuer.me/notebook/del [bookid]  
  > {}  

#### Todo相关  

* 获取用户todo列表

  > http://api.tuer.me/todo/user/uid [page,count]  
  > {}  

* 修改todo信息 <em>授权</em>

  > http://api.tuer.me/todo/edit/id [content,important]  
  > {}  

* 新增一条todo <em>授权</em>

  > http://api.tuer.me/todo/save [content,important]
  > {}  

* 删除一条todo <em>授权</em>

  > http://api.tuer.me/del [id]  
  > {}  

#### tips相关  

* 获取提醒消息 <em>授权</em>

  > http://api.tuer.me/tips/all    
  > {}  

#### token相关  

* 刷新token值和有效期 

  > http://api.tuer.me/token/refresh [client_id,secret,oldtoken]  
  > {}  

### 错误信息查询
