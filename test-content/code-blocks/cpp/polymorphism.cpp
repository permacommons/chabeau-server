#include <iostream>
#include <memory>

class Shape {
public:
  virtual ~Shape() = default;
  virtual double area() const = 0;
  virtual void draw() const = 0;
};

class Circle : public Shape {
private:
  double radius;
public:
  Circle(double r) : radius(r) {}
  double area() const override { return 3.14159 * radius * radius; }
  void draw() const override { std::cout << "Drawing a circle\n"; }
};

class Rectangle : public Shape {
private:
  double width, height;
public:
  Rectangle(double w, double h) : width(w), height(h) {}
  double area() const override { return width * height; }
  void draw() const override { std::cout << "Drawing a rectangle\n"; }
};

int main() {
  std::vector<std::unique_ptr<Shape>> shapes;
  shapes.push_back(std::make_unique<Circle>(5.0));
  shapes.push_back(std::make_unique<Rectangle>(4.0, 6.0));
  
  for (const auto& shape : shapes) {
    shape->draw();
    std::cout << "Area: " << shape->area() << "\n\n";
  }
  
  return 0;
}