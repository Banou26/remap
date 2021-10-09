import { WebHid } from './services/hid/WebHid';
import {
  IKeyboard,
  IKeycodeCategory,
  IKeycodeInfo,
  IConnectResult,
} from './services/hid/Hid';

const webHid = new WebHid();
webHid.setConnectionEventHandler({
  close: (keyboard: IKeyboard) => {
    console.log('close', keyboard);
  },
  connect: (connectedKeyboard: IKeyboard) => {
    console.log('connectedKeyboard', connectedKeyboard);
  },
  disconnect: (disconnectedKeyboard: IKeyboard) => {
    console.log('disconnectedKeyboard', disconnectedKeyboard);
  },
});

// @ts-ignore
const getKeeb =
  // @ts-ignore
  (res?: IConnectResult) =>
    webHid
      .detectKeyboards()
      .then((keyboards) => void console.log(keyboards) || keyboards[0])
      .then(async (keyboard) => {
        console.log('res', res);
        console.log('keyboard', keyboard);
        await keyboard.open();
        console.log(
          'fetchBacklightBrightness',
          await keyboard.fetchBacklightBrightness()
        );

        const layersNumber = 4;
        const rowSize = 5;
        const columnSize = 15;

        try {
          // @ts-ignore
          const keymaps = Object
            // @ts-ignore
            .entries(
              // @ts-ignore
              (
                await keyboard.fetchKeymaps(
                  0,
                  layersNumber * rowSize,
                  columnSize,
                  'en-us'
                )
              ).keymap
            )
            .map(([key, keymap]) => ({
              ...keymap,
              row: key.split(',').shift(),
              column: key.split(',').shift(),
            }))
            .map((keymap) => keymap.keycodeInfo);

          const layers = Array(layersNumber)
            .fill(undefined)
            .map((_, layer) =>
              Array(rowSize)
                .fill(undefined)
                .map((_, row) =>
                  keymaps.slice(
                    columnSize * rowSize * layer + columnSize * row,
                    columnSize * rowSize * layer + columnSize * (row + 1)
                  )
                )
            );

          const longestKey = layers
            .flat()
            .sort((a, b) => a.length - b.length)
            .pop();
          if (!longestKey) return;
          const consoleLayers = layers.map((_, layer) =>
            Array(rowSize)
              .fill(undefined)
              .map((_, row) =>
                keymaps
                  .slice(
                    columnSize * rowSize * layer + columnSize * row,
                    columnSize * rowSize * layer + columnSize * (row + 1)
                  )
                  .map((key) =>
                    `${key.label.replace(/(▽)|(Any)/, ' ')}(${
                      key.code
                    })`.padEnd(longestKey.length - 1, ' ')
                  )
                  .join(' ')
                  .trim()
              )
              .join('\n')
          );

          consoleLayers.forEach((str, i) =>
            console.log(`console layer ${i}:\n${str}`)
          );

          // keyboard.updateKeymap(0, 1, 1, 26)
        } catch (err) {
          console.error(err);
        }
        console.log('fetchLayerCount', await keyboard.fetchLayerCount());
        console.log(
          'fetchSwitchMatrixState',
          await keyboard.fetchSwitchMatrixState()
        );
        console.log('getInformation', await keyboard.getInformation());
        await keyboard.updateBacklightBrightness(255);
        console.log(
          'fetchBacklightBrightness',
          await keyboard.fetchBacklightBrightness()
        );

        // const interval = setInterval(async () => {
        //   const { brightness } = await keyboard.fetchBacklightBrightness()
        //   await keyboard.updateBacklightBrightness(brightness ? 0 : 255)
        // }, 1000)
        // setTimeout(async () => {
        //   clearInterval(interval)
        //   await keyboard.updateBacklightBrightness(255)
        //   await keyboard.close()
        // }, 10000)
        await keyboard.close();
      })
      .catch((err) =>
        webHid
          .connect({ productId: 20043, vendorId: 35176 })
          .then((res) => getKeeb(res))
      );

// getKeeb();
