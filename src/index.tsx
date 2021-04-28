
import { WebHid } from './services/hid/WebHid';
import { IKeyboard, IKeycodeCategory, IKeycodeInfo, IConnectResult } from './services/hid/Hid';

const webHid = new WebHid()
webHid.setConnectionEventHandler({
  close: (keyboard: IKeyboard) => {
    console.log('close', keyboard)
  },
  connect: (connectedKeyboard: IKeyboard) => {
    console.log('connectedKeyboard', connectedKeyboard)
  },
  disconnect: (disconnectedKeyboard: IKeyboard) => {
    console.log('disconnectedKeyboard', disconnectedKeyboard)
  },
});

const getKeeb =
  // @ts-ignore
  (res?: IConnectResult) =>
    webHid
      .detectKeyboards()
      .then(keyboards => keyboards[0])
      .then(async keyboard => {
        console.log('res', res)
        console.log('keyboard', keyboard)
        await keyboard.open()
        console.log('fetchBacklightBrightness', await keyboard.fetchBacklightBrightness())
        // for (let i = 50; i--; i) {
        //   for (let i2 = 50; i2--; i2) {
        //     for (let i3 = 50; i3--; i3) {
        //       console.log('fetchKeymaps', await keyboard.fetchKeymaps(i,i2,i3, 'en-us'))
        //     }
        //   }
        // }
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,0,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,1,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,2,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,3,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,4,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,5,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,6,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,7,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,8,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,9,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,10,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,11,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,12,0, 'en-us'))
        // console.log('fetchKeymaps', await keyboard.fetchKeymaps(0,13,0, 'en-us'))
        // @ts-ignore
        var groupBy = function(xs, key) {
          // @ts-ignore
          return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
          }, {});
        };

        const layersNumber = 4
        const rowSize = 5
        const columnSize = 15

        try {
          // @ts-ignore
          const keymaps =
            Object
              // @ts-ignore
              .entries((await keyboard.fetchKeymaps(0, layersNumber * rowSize, columnSize, 'en-us')).keymap)
              .map(([key, keymap]) => ({
                ...keymap,
                row: key.split(',').shift(),
                column: key.split(',').shift()
              }))
              .map(keymap => keymap.keycodeInfo.label)

          console.log('keymaps', keymaps)
          // @ts-ignore
          const layers =
            Array(layersNumber)
              .fill(undefined)
              // .map((_, i) => [columnSize * i, columnSize * (i + 1)])
              .map((_, layer) =>
                Array(rowSize)
                  .fill(undefined)
                  .map((_, row) => keymaps.slice((columnSize * rowSize * layer) + columnSize * row, (columnSize * rowSize * layer) + columnSize * (row + 1)).join(' '))
                  .join('\n')
              )
              .forEach((str, i) => console.log(`layer ${i}:\n${str}`))
          // console.log('layers', layers)
        } catch (err) {
          console.error(err)
        }
        console.log('fetchLayerCount', await keyboard.fetchLayerCount())
        console.log('fetchSwitchMatrixState', await keyboard.fetchSwitchMatrixState())
        console.log('getInformation', await keyboard.getInformation())
        await keyboard.updateBacklightBrightness(255)
        console.log('fetchBacklightBrightness', await keyboard.fetchBacklightBrightness())

        // const interval = setInterval(async () => {
        //   const { brightness } = await keyboard.fetchBacklightBrightness()
        //   await keyboard.updateBacklightBrightness(brightness ? 0 : 255)
        // }, 1000)
        // setTimeout(async () => {
        //   clearInterval(interval)
        //   await keyboard.updateBacklightBrightness(255)
        //   await keyboard.close()
        // }, 10000)
        await keyboard.close()
      })
      .catch(err => webHid.connect({ productId: 20043, vendorId: 35176 }).then(res => getKeeb(res)))

getKeeb()
