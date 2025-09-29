class Animal:
    def __init__(self, name, species):
        self.name = name
        self.species = species
    
    def make_sound(self):
        pass

class Dog(Animal):
    def make_sound(self):
        return f'{self.name} says Woof!'

class Cat(Animal):
    def make_sound(self):
        return f'{self.name} says Meow!'

# Create instances
my_dog = Dog('Buddy', 'Canine')
my_cat = Cat('Whiskers', 'Feline')

print(my_dog.make_sound())
print(my_cat.make_sound())