const cookieName = 'bilibili'
const cookieKey = 'chavy_cookie_bilibili'
const chavy = init()
const cookieVal = chavy.getdata(cookieKey)
let url = {
  url: '',
  headers: {
    Cookie: cookieVal,
    Origin: 'api.live.bilibili.com',
    Referer: 'http://live.bilibili.com/',
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
  }
}
const signUrl = `https://api.live.bilibili.com/sign/doSign`
const getSignInfo = `https://api.live.bilibili.com/sign/GetSignInfo`
const getRegionRanking = `http://api.bilibili.com/x/web-interface/ranking/region`

// sign()
getAid()

function sign() {
  url.url = signUrl
  chavy.get(url, (error, response, data) => {
    let result = JSON.parse(data)
    let title = `${cookieName}`
    // 签到成功
    if (result && result.code == 0) {
      let subTitle = `签到结果: 成功`
      let detail = `本月累计: ${result.data.hadSignDays}/${result.data.allDays}次, 说明: ${result.data.text}`
      chavy.msg(title, subTitle, detail)
    }
    // 签到重复
    else if (result && result.code == 1011040) {
      getsigninfo()
    }
    // 签到失败
    else {
      let subTitle = `签到结果: 失败`
      let detail = `说明: ${result.message}`
      chavy.msg(title, subTitle, detail)
    }
    chavy.log(`${cookieName}, data: ${data}`)
  })

  chavy.done()
}
function getsigninfo() {
  url.url = getSignInfo
  chavy.get(url, (error, response, data) => {
    let title = `${cookieName}`
    let subTitle = `签到结果: 成功 (重复签到)`
    let detail = ``
    let result = JSON.parse(data)
    if (result && result.code == 0)
      detail = `本月累计: ${result.data.hadSignDays}/${result.data.allDays}次, 说明: ${result.data.text}`
    chavy.msg(title, subTitle, detail)
  })
}
function videoWatch() {
  let playedTime = randomNum(0, 90) + 1
  url.url = 'aid=' + aid + '&played_time' + playedTime
}
function getAid(cb) {
  url.url = getRegionRanking
  chavy.get(url, (error, response, data) => {
    let title = `${cookieName}`
    let subTitle = `签到结果: 成功 (重复签到)`
    // console.log(data)
    let result = JSON.parse(data)
    console.log(result)
    chavy.msg(title, subTitle, detail)
  })
}
function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10)
      break
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
      break
    default:
      return 0
      break
  }
}
function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = key => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = message => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then(resp => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then(resp => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
