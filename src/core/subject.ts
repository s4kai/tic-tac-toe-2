import type { Observer } from "./observer";

export class Subject{
  private observers: Observer[] = [];

  public subscribe(observer: Observer){
    this.observers.push(observer)
  }

  public unsubscribe(observer: Observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  public notify(data: any){
    this.observers.forEach(
      observer => observer.update(data)
    )
  }
}