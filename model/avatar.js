var users = db.users.find({},{'avatar':1});
print(users.length());
