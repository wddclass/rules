const cookieName = 'bilibili'
const cookieKey = 'chavy_cookie_bilibili'
const chavy = init()
const cookieVal = chavy.getdata(cookieKey)
const cookieValArr = cookieVal.split(';')
const cookieValVerify = cookieValArr[3] + ';' + cookieValArr[2] + ';' + cookieValArr[0]
let url = {
  url: '',
  headers: {}
}
url.headers['Cookie'] = cookieValVerify
url.headers['Connection'] = 'keep-alive'
url.headers['Referer'] = 'https://www.bilibili.com/'
url.headers['User-Agent'] =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'

// API列表
const signUrl = `https://api.bilibili.com/x/web-interface/nav`
const getSignInfo = `https://api.live.bilibili.com/sign/GetSignInfo`
const getRegionRanking = `https://api.bilibili.com/x/web-interface/ranking/region`
const videoHeartbeat = `https://api.bilibili.com/x/click-interface/web/heartbeat`
const AvShare = `https://api.bilibili.com/x/web-interface/share/add`
const Manga = `https://manga.bilibili.com/twirp/activity.v1.Activity/ClockIn`
const needCoin = `https://www.bilibili.com/plus/account/exp.php`
const isCoinUrl = `https://api.bilibili.com/x/web-interface/archive/coins`
const CoinAdd = `https://api.bilibili.com/x/web-interface/coin/add`

const WATCH = true
const SHARE = true
const MANGA_SIGN = true
const COIN_ADD = true

let biliResult = [
  {
    title: '签到',
    result: '失败'
  },
  {
    title: '视频观看',
    result: '失败'
  },
  {
    title: '视频分享',
    result: '失败'
  },
  {
    title: '漫画签到',
    result: '失败'
  },
  {
    title: '投币任务',
    result: '失败'
  }
]

let userInfo,
  numberOfCoins = 0,
  aidList = [],
  coins = 0,
  exp = 0

// !(async () => {
//   if (WATCH) await videoWatch()
//   if (SHARE) await avShare()
//   if (MANGA_SIGN) await mangaSign()
//   if (COIN_ADD) await doCoinAdd()
// })().finally(() => {
//   finalToast()
// })
sign()

// 登录签到
function sign() {
  url.url = signUrl
  chavy.get(url, (error, response, data) => {
    let result = JSON.parse(data)
    if (result && result.code == 0) {
      biliResult[0].result = '成功'
      exp += 5
      userInfo = result.data
    }
    getAid()
  })
}

// 获取4分区视频aid
function getAid() {
  chavy.get(
    {
      url: getRegionRanking + '?rid=4&day=3'
    },
    (error, response, data) => {
      let result = JSON.parse(data)
      for (let i = 0; i < result.data.length; i++) {
        const element = result.data[i]
        aidList.push(element.aid)
      }
      detail = result.data[0].aid
      videoWatch(detail)
    }
  )
}
// 视频观看
function videoWatch(aid) {
  let playedTime = randomNum(0, 90) + 1
  url.url = videoHeartbeat + '?aid=' + aid + '&played_time=' + playedTime
  chavy.post(url, (error, response, data) => {
    avShare(aid)
    let result = JSON.parse(data)
    if (result && result.code == 0) {
      biliResult[1].result = '成功'
      exp += 5
    }
  })
}
// 视频分享
function avShare(aid) {
  url.url = AvShare + '?aid=' + aid + '&csrf=' + getCaption(cookieValArr[3])
  chavy.post(url, (error, response, data) => {
    mangaSign()
    let result = JSON.parse(data)
    if (result && result.code == 0) {
      biliResult[2].result = '成功'
      exp += 5
    } else if (result && result.code == 71000) {
      biliResult[2].result = '已分享'
      exp += 5
    }
  })
}
// 漫画签到
function mangaSign() {
  url.url = Manga + '?platform=ios'
  chavy.post(url, (error, response, data) => {
    expConfirm()
    let result = JSON.parse(data)
    if ((result && result.code == 0) || result.code == 'invalid_argument') {
      biliResult[3].result = '成功'
    }
  })
}
/**
 * 获取当前投币获得的经验值
 *
 * @return 还需要投几个币  (50-已获得的经验值)/10
 */
function expConfirm() {
  url.url = needCoin
  chavy.get(url, (error, response, data) => {
    let result = JSON.parse(data)
    if (result) {
      if (result.number == 50) {
        biliResult[4].result = '已投币'
        exp += result.number
        finalToast()
      } else {
        numberOfCoins = (50 - result.number) / 10
        if (userInfo.money <= numberOfCoins) {
          numberOfCoins = parseInt(userInfo.money) - 1
        }
        coinReady()
      }
    } else {
      finalToast()
    }
  })
}
// 投币准备工作
async function coinReady() {
  let canCoinList = []
  for (let i = 0; i < aidList.length; i++) {
    let result = await isCoin(aidList[i])
    if (!result) {
      canCoinList.push(aidList[i])
    }
  }
  if (numberOfCoins <= canCoinList.length) {
    canCoinList = canCoinList.slice(0, numberOfCoins)
  }
  for (let i = 0; i < canCoinList.length; i++) {
    await doCoinAdd(canCoinList[i])
  }
  biliResult[4].result = '已投' + coins + '币'
  let coinsExp = 10 * coins
  exp += coinsExp
  finalToast()
}
function finalToast() {
  let subTitle = '',
    detail = ''
  for (let i = 0; i < biliResult.length; i++) {
    const element = biliResult[i]
    subTitle += element.result + (i == biliResult.length - 1 ? '' : ',')
    detail += element.title + ':' + element.result + '\n'
  }
  chavy.msg('BILIBILI 升级 +' + exp, subTitle, detail)
  chavy.done()
}

/**
 * 检查是否投币
 *
 * @param aid av号
 * @return 返回是否投过硬币了
 */
function isCoin(aid) {
  url.url = isCoinUrl + '?aid=' + aid
  return new Promise(resolve => {
    chavy.get(url, (error, response, data) => {
      let result = JSON.parse(data)
      if (result) {
        if (result.data.multiply > 0) {
          resolve(true)
        } else {
          resolve(false)
        }
      } else {
        resolve(false)
      }
    })
  })
}

/**
 * 投币
 *
 * @param aid av号
 */
function doCoinAdd(aid) {
  return new Promise(resolve => {
    url.url =
      CoinAdd + '?aid=' + aid + '&multiply=1&select_like=0&cross_domain=true&csrf=' + getCaption(cookieValArr[3])
    chavy.post(url, (error, response, data) => {
      let result = JSON.parse(data)
      if (result && result.code == 0) {
        coins = ++coins
      }
      resolve()
    })
  })
}

// 获取cookie具体值
function getCaption(obj) {
  var index = obj.lastIndexOf('=')
  obj = obj.substring(index + 1, obj.length)
  return obj
}

// 生成随机整数
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
