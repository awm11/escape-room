import time
import sys
import os
sys.stdout.reconfigure(encoding='utf-8')


def main():
    print("""
        1 - menus_start()
        2 - alpha_explains()
        3 - testing_you()
        4 - pendulum_task()
        5 - check_period()
        6 - engine_code_task()
        7 - menus_end()
        8 - start_spaceship_engine()
        9 - final_alpha()""")
    
    start_point = int(input("\n Select program start point:  "))
    os.system('clear')

    run_from_start_point(start_point)
    time.sleep(500)

def run_from_start_point(start_point):
    # Ensure the start_point is within valid bounds
    functions = [menus_start, alpha_explains, testing_you, pendulum_task, check_period, engine_code_task, menus_end, start_spaceship_engine, final_alpha]
    if start_point < 1 or start_point > len(functions):
        print("Invalid start point!")
        return
    
    # Adjust the start_point to 0-indexed for list access
    for func in functions[start_point - 1:]:
        func()

def menus_start():
    menu_options = {
        "Engines": "\nEngines offline. Engines cannot be restarted at this time. For more information, reach out to your engineer at the Martian Citadel.",
        "Heating": "\nTemperature in living quarters: 5°C \nHeating unavailable at this time. For more information, reach out to your engineer at the Martian Citadel.",
        "Waste disposal": "\nWaste disposal logs unavailable at this time. For more information, reach out to your engineer at the Martian Citadel.",
        "Navigation": "\nNavigation unavailable at this time. For more information, reach out to your engineer at the Martian Citadel.",
        "Call Martian Citadel": "\nCalling Martian Citadel"}
    while True:
        print_slow("\nEngines\nHeating\nWaste disposal\nNavigation\nCall Martian Citadel\n\n", 0.01)
        menu_selection = input("\033[1;32mSelect a menu item to continue...\033[0m")
        if not menu_selection in menu_options:
            print("\n\033[91mInvalid menu selection. Please try again.\033[0m")
        else:
            print(menu_options[menu_selection])
            if menu_selection == "Call Martian Citadel":
                break
    print_slow("...............", 0.5)

def alpha_explains():
    alpha_talk("This is Mars Base Alpha. Tempora, what seems to be the problem?")
    input("\n You:  ")
    alpha_talk("Okay, hold tight, Tempora, let me check your logs.")
   # time.sleep(10)
    alpha_talk("Your nuclear fusion engines are not firing. I can see that your heating is in energy saving mode - that's why the temperature is so low.")
    time.sleep(2)
    alpha_talk("Don't worry, I'd say we have about 40 minutes before the temperature reaches dangerous levels.")
    alpha_talk("You will need to find the restart code for the engines. I can guide you through the process.")
    time.sleep(2)
    alpha_talk("I'll need clearance from Earth to force the restart, which will take a while, because of the speed of light delay.")
    time.sleep(1)
    alpha_talk("This is all highly unusual.")
    time.sleep(1)

def testing_you(secret_phrase=["Time's tide waits for no one: set course for the future.", "\"Time's tide waits for no one: set course for the future.\""]):
    alpha_talk("In the meantime, I think it's worth locating the Tempora's Orbital Utility Kit. There are some things in there that will help you carry out your mission.")
    time.sleep(2)
    alpha_talk("Maybe the captain has left the access code in the ship’s manual? I expect it will be in code, though. ")
    while True:
        phrase=input("\n you:  ")
        if phrase in secret_phrase:
            alpha_talk("You found it!")
            alpha_talk("I'm sorry, Tempora, we had to test that you were up to the job. We don't let just anyone play around with the engines.")
            alpha_talk("Now, there's one more task I need you to do.")
            break
        else:
            alpha_talk("I can't help you any further right now. You'll know when to come back.")

def pendulum_task():
    alpha_talk("I don't want to risk restarting your engines if the artificial gravity has gone haywire... That would not lead to a happy outcome...")
    time.sleep(1)
    alpha_talk("But I can't seem to read your logs from here. Does the gravity feel normal to you?")
    answer=input("\n You: ")
    if 'y' in answer or 'Y' in answer:
        alpha_talk("Okay, great, let's take an accurate measurement, just to be sure.")
    else:
        alpha_talk("Hmmm, okay. Let's take an accurate measurement, just to be sure.")
    time.sleep(1)

def engine_code_task():
    alpha_talk("And it's good timing Tempora. I expect you're getting a bit chilly, but the good news is I've heard back from Earth.")
    alpha_talk("They've given authorisation to force the restart of your engines.")
    time.sleep(2)
    alpha_talk("The restart code is in the Captain's Locker - and you'll find the access code under the captain's desk. You might need some things from the orbital utility kit to read the final code.")
    time.sleep(2)
    alpha_talk("I'll end our call for now. Good luck!\n\n")

def menus_end():
    menu_options = ("Engines","Heating","Waste disposal","Navigation","Call Martian Citadel")
    while True:
        print_slow("\nEngines\nHeating\nWaste disposal\nNavigation\nCall Martian Citadel\n\n", 0.01)
        menu_selection = input("\033[1;32mSelect a menu item to continue...\033[0m")
        if not menu_selection in menu_options:
            print("\n\033[91mInvalid menu selection. Please try again.\033[0m")
            print("")
        elif menu_selection == "Engines":
            input("\nEngines inactive. Press enter to restart engines.")
            break
        else:
            print(f"\n\033[91m{menu_selection} is not available at this time.\033[0m")

def progress_bar(duration):
    total_ticks = 100
    for tick in range(total_ticks + 1):
        progress = tick / total_ticks
        bar_length = int(progress * 50)
        bar = '[' + '#' * bar_length + '-' * (50 - bar_length) + ']'
        percent = int(progress * 100)
        sys.stdout.write('\r' + bar + ' ' + str(percent) + '%')
        sys.stdout.flush()
        time.sleep(duration / total_ticks)
    sys.stdout.write('\n')

def start_spaceship_engine():
    while True:
        code=input("ENTER ENGINE RESTART CODE:  ")
        if code == "8643":
            print("Code correct. Checking engine status...")
            break
        else:
            print("Code incorrect, try again.")
    time.sleep(3)
    print_slow("|||||||||||||||||")
    time.sleep(1)
    print("Activating time dilation sensors")
    time.sleep(1)
    progress_bar(1)
    print("Time dilation sensors activated...")
    time.sleep(3)
    print("Engine ignition sequence initiated...")
    time.sleep(3)
    progress_bar(8)
    time.sleep(3)
    print("\033[1;32mEngine startup complete!\033[0m")  # Print in bold green color
    time.sleep(1)


def final_alpha():
    
    print("████████╗     ███████╗     ███╗   ███╗     ██████╗        ██████╗     ██████╗       █████╗")       
    print("╚══██╔══╝     ██╔════╝     ████╗ ████║     ██╔═███╗      ██╔═══██╗    ██╔══██╗     ██╔══██╗")      
    print("   ██         █████╗       ██╔████╔██║     ██████╔╝      ██║   ██║    ██████╔╝     ███████║")      
    print("   ██         ██╔══╝       ██║╚██╔╝██║     ██╔═══╝       ██║   ██║    ██╔══██╗     ██╔══██║")      
    print("   ██║        ███████╗     ██║ ╚═╝ ██║     ██║           ╚█ ████╔╝    ██║  ██║     ██║  ██║")      
    print("   ╚═╝        ╚══════╝     ╚═╝     ╚═╝     ╚═╝            ╚═════╝     ╚═╝  ╚═╝     ╚═╝  ╚═╝")      
     
    time.sleep(2)


    print_slow(" Incoming call from Mars Base Alpha:")
    print_slow("\n Connecting")
    print_slow("...........", 0.5)
    alpha_talk("Tempora, are you there? \n")
    input(" You: ")
    time.sleep(1)
    alpha_talk("You did it! The engines are restarted, and it should start to feel a bit warmer very soon!")
    time.sleep(1)
    alpha_talk("I've sent an UberSpace from Mars Alpha to pick you up. They should be with you in a few hours. You've got quite a tale to tell.")
    time.sleep(1)
    alpha_talk("Until then, fly safely.")

def check_period():
    alpha_talk("There are instructions for calibrating the ships artificial gravity in the TEMPORA user manual.")
    time.sleep(2)
    alpha_talk("Type the value here for me when you have a reading for 1 period. \n")
    while True:
        try:
            while True:
                try:
                    Period = input("\n VALUE in seconds = ")
                    float(Period)
                    break
                except ValueError:
                    alpha_talk("TEMPORA, I need you to provide a value for the period. Put it below.")
            Period = float(Period) #has been checked above.
            if 0.95 <= Period <= 1.05:
                alpha_talk("I think you might have counted each swing. Remember a full period is there AND back again. Try doubling the number?")
                raise ValueError
            elif Period <= 0.95:
                alpha_talk("That doesn't look right. I'm going to need you to check it again.")
                raise ValueError
            elif 1.05 <= Period <= 1.9:
                alpha_talk("That doesn't look right. I'm going to need you to check it again.")
                raise ValueError
            elif Period > 2.1:
                alpha_talk("That looks a bit too long. I'm going to need you to check it again.")
                raise ValueError
            elif 1.9 <= Period <= 2.1:
                alpha_talk("Nice work, it looks like the artificial gravity is functioning normally!")
                break
        except ValueError:
            print("\n")
            
def alpha_talk(text):
    print_slow("\n\033[1m MARS BASE ALPHA:   \033[0m", 0.01)
    time.sleep(0.5)
    print_slow(text)

def print_slow(text, speed=0.05):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(speed)  # Adjust this value for the desired speed

if __name__ == "__main__":
    main()
