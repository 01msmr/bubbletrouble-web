from enum import Enum
import pygame
import random
import time

pygame.init()
bounds = (1200, 800)
window = pygame.display.set_mode(bounds)

background = pygame.Surface((1200, 800))
background.fill(pygame.Color('#eeeeee'))
pygame.display.set_caption('Bubble Trouble')




class Color(Enum):
  BLUE = 0
  YELLOW = 1
  GREEN = 2
  PINK = 3



class Card:
  values = [5,10,15,20,25]
  value_count = [1,1,2,1,1]         ### short test
  #value_count = [3,6,8,6,3]

  def __init__(self, color, value):
    self.color = color
    self.value = value
    orig_width = 600
    orig_height = 855
    scale_factor = 3.0
    self.width = orig_width/scale_factor
    self.height = orig_height/scale_factor
    self.image0 = pygame.image.load('images/card-shadow.png').convert_alpha()
    self.image1 = pygame.image.load('images/card-base.png')
    self.image1a = pygame.image.load('images/card-back.png')
    self.image2 = pygame.image.load('images/' + self.color.name + '.png')
    self.image3 = pygame.image.load('images/' + str(self.value) + '.png')
    self.image4 = pygame.image.load('images/card-gloss.png')

    self.randomnumberx = random.choice(range(-50, 50, 1))/10
    self.randomnumbery = random.choice(range(-50, 50, 1))/10

    # RANDOM ROTATE BY 5°
    self.image0 = pygame.transform.rotate(self.image0, self.randomnumberx)
    self.image1 = pygame.transform.rotate(self.image1, self.randomnumberx)
    self.image1a = pygame.transform.rotate(self.image1a, self.randomnumberx)
    self.image2 = pygame.transform.rotate(self.image2, self.randomnumberx)
    self.image3 = pygame.transform.rotate(self.image3, self.randomnumberx)
    self.image4 = pygame.transform.rotate(self.image4, self.randomnumberx)

    self.image0 = pygame.transform.scale(self.image0, (self.width, self.height))
    self.image1 = pygame.transform.scale(self.image1, (self.width, self.height))
    self.image1a = pygame.transform.scale(self.image1a, (self.width, self.height))
    self.image2 = pygame.transform.scale(self.image2, (self.width, self.height))
    self.image3 = pygame.transform.scale(self.image3, (self.width, self.height))
    self.image4 = pygame.transform.scale(self.image4, (self.width, self.height))
  
  def draw(self, x, y, front):
    randomnumberx = self.randomnumberx
    randomnumbery = self.randomnumbery
    rx = x + 2*randomnumberx
    ry = y + 3*randomnumbery - 3

    order = 3.6


    if front:
      shadow_offset = 11-abs(randomnumberx)
      screen.blit(self.image0,(rx+shadow_offset,ry+shadow_offset*0.6))
      screen.blit(self.image1,(rx,ry))
      screen.blit(self.image2,(rx,ry))
      screen.blit(self.image3,(rx,ry))
      screen.blit(self.image4,(rx,ry))
    else:
      # deck (with backsides) is more aligned than the pile
      randomnumberx = randomnumberx/order
      randomnumbery = randomnumbery/order
      rx = x + 2*randomnumberx
      ry = y + 3*randomnumbery - 3
      shadow_offset = 11/order-abs(randomnumberx)
      screen.blit(self.image0,(rx+shadow_offset,ry+shadow_offset*0.6))
      screen.blit(self.image1a,(rx,ry))
      screen.blit(self.image4,(rx,ry))


class Deck:
  def __init__(self):
    self.cards = []
    for color in Color:
      for value,count in zip(Card.values, Card.value_count):
        for i in range(count):
          self.cards.append(Card(color, value))

  def __len__(self):
    return len(self.cards)

  def shuffle(self):
    random.SystemRandom().shuffle(self.cards)

  def deal(self):
    return self.cards.pop()



class Pile:
  def __init__(self):
    self.cards = []

  def add(self, card):
    self.cards.append(card)

  def peek(self):
    if self.cards:
      return self.cards[-1]
    else:
      return None

  def popAll(self):
    return self.cards

  def clear(self):
    self.cards = []

  # def isSnap(self):
  #   if len(self.cards) > 1:
  #     return self.cards[-1].value == self.cards[-2].value
  #   return False
  


# from pygame.locals import*


white = (255, 255, 255)
w = 1200
h = 800
screen = pygame.display.set_mode((w, h))
screen.fill((white))
running = 1

deck = Deck()
deck.shuffle()

# card = deck.deal()

lastdeal = time.time()

clock = pygame.time.Clock()

playdeck = []

playpile = []



is_running = True

while is_running:
  currentTime = time.time()
  
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      is_running = False

  # draw pile (just backsides)
  for card in deck.cards:
    card.draw(220+card.width*1.4,95,front=False)
  
  if currentTime - lastdeal > 0.55:
    playdeck.append(deck.deal())
    screen.fill(white)
    for card in playdeck:
      card.draw(220,95,front=True)
    lastdeal = currentTime
  
  pygame.display.flip()
  clock.tick(30)