// for serialization
function buildParams(prefix, obj, add) {
  let name;
  if (Array.isArray(obj)) {
    obj.map((v, i) => buildParams(prefix + '[' + (v + '') + ']', v, add));
  } else if (Object.prototype.toString.call(obj) === '[object Object]') {
    for (name in obj) buildParams(prefix + '[' + name + ']', obj[name], add);
  } else {
    add(prefix, obj);
  }
}

class Lib {
  constructor() {

  }
  $(...arg) {
    return document.querySelector(...arg);
  }
  $$(...arg) {
    return document.querySelectorAll(...arg);
  }
  initLoading(ele) {
    let loading = ele.querySelectorAll('.spinner')[0];
    if (loading) return loading;
    let html = document.createElement('div');
    html.className = 'spinner';
    html.innerHTML = '<div class="bounce"></div><div class="bounce"></div><div class="bounce"></div>';
    ele.insertBefore(html, ele.firstChild);
    return ele.querySelectorAll('.spinner')[0];
  }
  hideLoading(ele = document.body) {
    let loading = this.initLoading(ele);
    loading.classList.add('hidden');
  }
  showLoading(ele = document.body) {
    let loading = this.initLoading(ele);
    loading.classList.remove('hidden');
  }
  serialization(a) {
    let prefix;
    let s = [];

    function add(key, value) {
      value = typeof value === 'function' ? value() : (value + '');
      s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }
    if (Array.isArray(a)) {
      a.map((e, i) => add(i, e));
    } else {
      for (prefix in a) buildParams(prefix, a[prefix], add);
    }
    return s.join('&');
  }

  // _.ajax({
  //   url: 'http://xxx.com/api/test',
  //   type: 'get',
  //   data: {
  //     page: 1
  //   },
  //   headers:{
  //    'Content-Type':'application/x-www-form-urlencoded',
  //    'Accept':'application/json'
  //   },
  //   success:function(data){
  //     console.log(data)
  //   },
  //   error:function(data){
  //     console.error(data)
  //   }
  // })
  ajax(opt) {
    if (!opt.hasOwnProperty('url')) return false;
    let xmlhttp = new XMLHttpRequest();
    let def = {
      type: 'get',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      data: null
    };

    // merge default
    let config = Object.assign(def, opt);

    // serialization data
    config.data = config.data && this.serialization(config.data);

    // callback
    xmlhttp.addEventListener('load', function (event) {
      let status = xmlhttp.status;
      let isSuccess = status >= 200 && status < 300 || status === 304;
      let res = null;
      // - -、
      try {
        res = JSON.parse(xmlhttp.responseText);
      } catch (err) {
        res = xmlhttp.responseText;
      }

      if (isSuccess && config.hasOwnProperty('success')) {
        config.success(res);
      } else if (config.hasOwnProperty('error')) {
        config.error(res);
      }
    });

    // send request
    let tragetUrl = config.url;
    if (config.type.toLowerCase() === 'get' && config.data) tragetUrl += '?' + config.data;
    xmlhttp.open(config.type, tragetUrl, true);
    for (let i in config.headers) xmlhttp.setRequestHeader(i, config.headers[i]);
    xmlhttp.send(config.data);

  }
};

let exportLib = new Lib();

export default exportLib;
