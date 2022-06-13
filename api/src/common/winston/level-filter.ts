import winston = require('winston');
export function filterOnly(level: any) {
  return winston.format(function (info) {
    if (info.level === level) {
      return info;
    } else return false;
  })();
}
