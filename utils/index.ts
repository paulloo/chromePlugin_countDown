import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"

dayjs.extend(duration)

// 统一时分秒最少两个字符
export function padZero(num) {
  return num < 10 ? `0${num}` : num
}

// 使用 dayjs  写一个 倒计时的函数
export function countDown(date) {
  const now = dayjs()
  const end = dayjs(date)
  const duration = dayjs.duration(end.diff(now))
  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()
  const seconds = duration.seconds()

  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    ms: duration.asMilliseconds(),
    time: `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`
  }
}



// 动态导入文件
export function loadStaticFile(soundPath, path="sound") {
  return import(
    /* webpackIgnore: true */
    `${path === 'sound'? 'data-base64:': ''}~assets/${path}/${soundPath}`
  ).then((module) => {
    return module.default;
  }).catch(err => {
    console.error("Error loading the sound:", err);
    return null;
  });
}
