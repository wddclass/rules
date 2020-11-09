const cookieName = '万能的福利吧'
const cookieKey = 'wddclass_cookie_fuliba'
const cookieVal = $prefs.valueForKey(cookieKey)

function sign() {
  let url = {
    url: `https://www.wnflb66.com/plugin.php?id=fx_checkin:checkin&formhash=4c778427&4c778427&infloat=yes&handlekey=fx_checkin&inajax=1&ajaxtarget=fwin_content_fx_checkin`,
    method: 'GET',
    headers: {
      Cookie: cookieVal
    }
  }
  $task.fetch(url).then((response) => {
    console.log(response.body)
    let data = response.body
    let title = `${cookieName}`
    if (data.indexOf('签名出错-2') >= 0) {
      let subTitle = `签到结果: 签到跳过`
      let detail = `今天已经签过了`
      $notify(title, subTitle, detail)
    } else if (data.indexOf('签到成功') >= 0) {
      let subTitle = '签到结果：签到成功！'
      let detail = data.substring( data.indexOf("累计签到"), data.indexOf("天") + 1)
      $notify(title, subTitle, detail)
    }
  })
}

sign({})