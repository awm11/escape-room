// The escape room script, ported line for line from escape.py.
// Each scene is the same function, in the same order, with the same text,
// pauses (in seconds) and typing speeds as the Python original.
//
//   t.write(text, speed)   -> print_slow(text, speed)
//   t.print(text)          -> print(text)
//   t.sleep(s)             -> time.sleep(s)
//   await t.input(prompt)  -> input(prompt)

import { ANSWERS, clean, matches } from './answers.js'

// The ship's menu. Originally typed out and answered by typing the item's name;
// now picked with the arrow keys (or a tap), which hands back the same text.
// Because only real options can be picked, the "Invalid menu selection"
// branches below can no longer be reached, but are kept to mirror escape.py.
const MENU = ['Engines', 'Heating', 'Waste disposal', 'Navigation', 'Call Martian Citadel']
const MENU_PROMPT = 'Select a menu item to continue...'
const chooseFromMenu = (t) => t.choose(MENU, MENU_PROMPT, 'prompt', 0.01)

async function alphaTalk(t, text) {
  await t.write('\n MARS BASE ALPHA:   ', 0.01, 'alpha')
  await t.sleep(0.5)
  await t.write(text)
}

// 1
async function menusStart(t) {
  const menuOptions = new Map([
    ['Engines', '\nEngines offline. Engines cannot be restarted at this time. For more information, reach out to your engineer at the Martian Citadel.'],
    ['Heating', '\nTemperature in living quarters: 5°C \nHeating unavailable at this time. For more information, reach out to your engineer at the Martian Citadel.'],
    ['Waste disposal', '\nWaste disposal logs unavailable at this time. For more information, reach out to your engineer at the Martian Citadel.'],
    ['Navigation', '\nNavigation unavailable at this time. For more information, reach out to your engineer at the Martian Citadel.'],
    ['Call Martian Citadel', '\nCalling Martian Citadel'],
  ])
  while (true) {
    const selection = await chooseFromMenu(t)
    if (!menuOptions.has(selection)) {
      t.print('\nInvalid menu selection. Please try again.', 'error')
    } else {
      t.print(menuOptions.get(selection))
      if (selection === 'Call Martian Citadel') break
      await t.sleep(2) // let the message be read before the menu reprints
    }
  }
  await t.write('...............', 0.5)
}

// 2
async function alphaExplains(t) {
  await alphaTalk(t, 'This is Mars Base Alpha. Tempora, what seems to be the problem?')
  await t.input('\n You:  ')
  await alphaTalk(t, 'Okay, hold tight, Tempora, let me check your logs.')
  await alphaTalk(t, "Your nuclear fusion engines are not firing. I can see that your heating is in energy saving mode - that's why the temperature is so low.")
  await t.sleep(2)
  await alphaTalk(t, "Don't worry, I'd say we have about 40 minutes before the temperature reaches dangerous levels.")
  await alphaTalk(t, 'You will need to find the restart code for the engines. I can guide you through the process.')
  await t.sleep(2)
  await alphaTalk(t, "I'll need clearance from Earth to force the restart, which will take a while, because of the speed of light delay.")
  await t.sleep(1)
  await alphaTalk(t, 'This is all highly unusual.')
  await t.sleep(1)
}

// 3
async function testingYou(t) {
  await alphaTalk(t, "In the meantime, I think it's worth locating the Tempora's Orbital Utility Kit. There are some things in there that will help you carry out your mission.")
  await t.sleep(2)
  await alphaTalk(t, 'Maybe the captain has left the access code in the ship’s manual? I expect it will be in code, though. ')
  while (true) {
    const phrase = await t.input('\n you:  ')
    if (matches(phrase, ANSWERS.secretPhrase)) {
      await alphaTalk(t, 'You found it!')
      await alphaTalk(t, "I'm sorry, Tempora, we had to test that you were up to the job. We don't let just anyone play around with the engines.")
      await alphaTalk(t, "Now, there's one more task I need you to do.")
      break
    } else {
      t.miss('phrase')
      await alphaTalk(t, "I can't help you any further right now. You'll know when to come back.")
    }
  }
}

// 4
async function pendulumTask(t) {
  await alphaTalk(t, "I don't want to risk restarting your engines if the artificial gravity has gone haywire... That would not lead to a happy outcome...")
  await t.sleep(1)
  await alphaTalk(t, "But I can't seem to read your logs from here. Does the gravity feel normal to you?")
  const answer = await t.input('\n You: ')
  // Original checked for a 'y' anywhere (so "not really" counted as yes).
  // Now: the answer has to start with y/Y ("yes", "yeah", "Y").
  if (/^y/i.test(clean(answer))) {
    await alphaTalk(t, "Okay, great, let's take an accurate measurement, just to be sure.")
  } else {
    await alphaTalk(t, "Hmmm, okay. Let's take an accurate measurement, just to be sure.")
  }
  await t.sleep(1)
}

// Same rules as Python's float(): optional sign, digits, decimal point, exponent.
const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/

// 5
async function checkPeriod(t) {
  await alphaTalk(t, 'There are instructions for calibrating the ships artificial gravity in the TEMPORA user manual.')
  await t.sleep(2)
  await alphaTalk(t, 'Type the value here for me when you have a reading for 1 period. \n')
  while (true) {
    let raw
    while (true) {
      raw = (await t.input('\n VALUE in seconds = ')).trim()
      if (NUMBER.test(raw)) break
      await alphaTalk(t, 'TEMPORA, I need you to provide a value for the period. Put it below.')
    }
    const period = parseFloat(raw)
    let failed = true
    if (0.95 <= period && period <= 1.05) {
      await alphaTalk(t, 'I think you might have counted each swing. Remember a full period is there AND back again. Try doubling the number?')
    } else if (period <= 0.95) {
      await alphaTalk(t, "That doesn't look right. I'm going to need you to check it again.")
    } else if (1.05 <= period && period <= 1.9) {
      await alphaTalk(t, "That doesn't look right. I'm going to need you to check it again.")
    } else if (period > 2.1) {
      await alphaTalk(t, "That looks a bit too long. I'm going to need you to check it again.")
    } else if (1.9 <= period && period <= 2.1) {
      await alphaTalk(t, 'Nice work, it looks like the artificial gravity is functioning normally!')
      failed = false
    }
    if (!failed) break
    t.miss('period')
    t.print('\n')
  }
}

// 6
async function engineCodeTask(t) {
  await alphaTalk(t, "And it's good timing Tempora. I expect you're getting a bit chilly, but the good news is I've heard back from Earth.")
  await alphaTalk(t, "They've given authorisation to force the restart of your engines.")
  await t.sleep(2)
  await alphaTalk(t, "The restart code is in the Captain's Locker - and you'll find the access code under the captain's desk. You might need some things from the orbital utility kit to read the final code.")
  await t.sleep(2)
  await alphaTalk(t, "I'll end our call for now. Good luck!\n\n")
}

// 7
async function menusEnd(t) {
  const menuOptions = ['Engines', 'Heating', 'Waste disposal', 'Navigation', 'Call Martian Citadel']
  while (true) {
    const selection = await chooseFromMenu(t)
    if (!menuOptions.includes(selection)) {
      t.print('\nInvalid menu selection. Please try again.', 'error')
      t.print('')
    } else if (selection === 'Engines') {
      await t.input('\nEngines inactive. Press enter to restart engines.')
      break
    } else {
      t.print(`\n${selection} is not available at this time.`, 'error')
      await t.sleep(2)
    }
  }
}

// 8
async function startSpaceshipEngine(t) {
  while (true) {
    const code = await t.input('ENTER ENGINE RESTART CODE:  ')
    if (matches(code, ANSWERS.engineCode)) {
      t.print('Code correct. Checking engine status...')
      break
    } else {
      t.miss('code')
      t.print('Code incorrect, try again.', 'error')
    }
  }
  await t.sleep(3)
  await t.write('|||||||||||||||||\n', undefined, 'bars')
  await t.sleep(1)
  t.print('Activating time dilation sensors')
  await t.sleep(1)
  await t.progressBar(1)
  t.print('Time dilation sensors activated...')
  await t.sleep(3)
  t.print('Engine ignition sequence initiated...')
  await t.sleep(3)
  await t.progressBar(8)
  await t.sleep(3)
  t.print('Engine startup complete!', 'success')
  t.heatingOn() // display only: the cabin temperature starts to rise
  await t.sleep(1)
}

const TEMPORA_BANNER = [
  '████████╗     ███████╗     ███╗   ███╗     ██████╗        ██████╗     ██████╗       █████╗',
  '╚══██╔══╝     ██╔════╝     ████╗ ████║     ██╔══██╗      ██╔═══██╗    ██╔══██╗     ██╔══██╗',
  '   ██         █████╗       ██╔████╔██║     ██████╔╝      ██║   ██║    ██████╔╝     ███████║',
  '   ██         ██╔══╝       ██║╚██╔╝██║     ██╔═══╝       ██║   ██║    ██╔══██╗     ██╔══██║',
  '   ██║        ███████╗     ██║ ╚═╝ ██║     ██║           ╚██████╔╝    ██║  ██║     ██║  ██║',
  '   ╚═╝        ╚══════╝     ╚═╝     ╚═╝     ╚═╝            ╚═════╝     ╚═╝  ╚═╝     ╚═╝  ╚═╝',
]

// 9
async function finalAlpha(t) {
  t.banner(TEMPORA_BANNER, 'banner')
  await t.sleep(2)
  await t.write(' Incoming call from Mars Base Alpha:')
  await t.write('\n Connecting')
  await t.write('...........', 0.5)
  await alphaTalk(t, 'Tempora, are you there? \n')
  await t.input(' You: ')
  await t.sleep(1)
  await alphaTalk(t, 'You did it! The engines are restarted, and it should start to feel a bit warmer very soon!')
  await t.sleep(1)
  await alphaTalk(t, "I've sent an UberSpace from Mars Alpha to pick you up. They should be with you in a few hours. You've got quite a tale to tell.")
  await t.sleep(1)
  await alphaTalk(t, 'Until then, fly safely.')
}

// `blurb` and `needs` are shown in the sys admin scene picker and the mission
// report. They never appear to students in the game itself.
export const SCENES = [
  { id: 'menus_start', title: 'Ship menus: call the Citadel', run: menusStart,
    blurb: 'The start of the mission. Students explore the ship menus, then call the Martian Citadel.' },
  { id: 'alpha_explains', title: 'Mars Base Alpha explains', run: alphaExplains,
    blurb: 'Alpha explains the engine failure and the 40 minutes before it gets dangerously cold.' },
  { id: 'testing_you', title: 'Secret phrase from the manual', run: testingYou,
    blurb: 'Students type the phrase from the torn-out page.', needs: 'The kettle puzzle solved' },
  { id: 'pendulum_task', title: 'Gravity check', run: pendulumTask,
    blurb: 'Alpha asks whether gravity feels normal, then asks for a measurement.' },
  { id: 'check_period', title: 'Pendulum period', run: checkPeriod,
    blurb: 'Students time the pendulum and enter the period in seconds.', needs: 'The pendulum set up in the clamp stand' },
  { id: 'engine_code_task', title: 'Clearance from Earth', run: engineCodeTask,
    blurb: "Alpha reports that Earth has cleared the restart and points to the Captain's Locker, then ends the call.", needs: 'Gravity check passed' },
  { id: 'menus_end', title: 'Ship menus: engines', run: menusEnd,
    blurb: 'Back at the ship menus. Students choose Engines to reach the restart code prompt.', needs: "The Captain's Locker opened" },
  { id: 'start_spaceship_engine', title: 'Engine restart code', run: startSpaceshipEngine,
    blurb: 'Students type the restart code from the red-filter grid. The engines start up.', needs: 'The restart code decoded' },
  { id: 'final_alpha', title: 'Final call', run: finalAlpha,
    blurb: 'Alpha makes the final call, then the mission report appears. The cabin warms up.' },
]
