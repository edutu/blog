var dbName = 'userDB', //数据库名
	daVer = 1,//数据库版本号
	db = '',//数据库对象
	dbData = [];//临时存放数据的数组

//链接数据库
function openDB(){
	var request = indexedDB.open(dbName,daVer);//如果数据库存在就打开，如果数据库不存在就去新建
	request.onsuccess = function(e){
		db = e.target.result;
		console.log(db);
		console.log('链接数据库成功');
		//连接数据库成功后渲染table表格
		vm.getData();
	}
	request.onerror = function(){
		console.log('连接数据库失败')
	}
	//创建新数据库，或者数据库版本号被更改的时候出发onupgradeneeded事件，并执行回调函数
	request.onupgradeneeded = function(e){
		db = e.target.result;
		//判断是否有这个对象仓库的存在
		if(!db.objectStoreNames.contains('Users')){
			//如果表格不存在，创建一个新的对象仓库（keyPath，主键 ； autoIncrement,是否自增），会返回一个对象（objectStore）
			var store = db.createObjectStore('Users',{keyPath:'id',autoIncrement:true});
			//指定可以被索引的字段，unique字段是否唯一，可以创建多个索引
			store.createIndex('username','username',{unique:false})
		}
	}
}
//保存数据
//通过事物transaction去操控对象仓库
function saveData(data){
	var tx = db.transaction('Users','readwrite');
	var store = tx.objectStore('Users');
	var req = store.put(data);
	req.onsuccess = function(){
		console.log(this)
		console.log('成功保存ID为'+this.result+'的数据')
	}
}
//删除单条数据
function deleteOneData(id){
	var tx = db.transaction('Users','readwrite');
	var store = tx.objectStore('Users');
	var req = store.delete(id);
	req.onsuccess = function(){
		vm.getData()
	}
}
//查询单条数据（配合索引）
function matcher(callback,curName){
	console.log(curName);
	var tx = db.transaction('Users','readwrite');
	var store = tx.objectStore('Users');
	var index = store.index("username");//打开数据库索引
	var range = IDBKeyRange.only(curName);//传递一个单键（索引的值）获取range
	var req = index.openCursor(range,'next');
	dbData = [];
	req.onsuccess = function(){
		console.log(this)
		var cursor = this.result;
		console.log(cursor)
		if(cursor){
			dbData.push(cursor.value);
			cursor.continue();
		}else{
			callback&&callback();//相当于if(callback){callback()}
		}
	}
}
//检索（遍历）全部数据
//通过游标cursor检索范围内的对象仓库中的数据
function searchData(callback){
	var tx = db.transaction('Users','readonly');
	var store = tx.objectStore('Users');
	var range = IDBKeyRange.lowerBound(1);
	var req = store.openCursor(range,'next');
	console.log(range,req,store)
	dbData = [];
	req.onsuccess = function(){
		console.log(this)
		var cursor = this.result;
		if(cursor){
			dbData.push(cursor.value);
			cursor.continue();
		}else{
			callback&&callback();//相当于if(callback){callback()}
		}
	}
}
//删除数据库
// function delDBer(){
// 	indexedDB.deleteDatabase('userDB');
// }