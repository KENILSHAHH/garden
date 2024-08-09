from nada_dsl import *

def nada_main():

    address = Party(name="0xAA6C32B4C3B869201A3e162F24bBe37BCacB02D9")
    return [Output(userAddress, "userAddress", address)]
