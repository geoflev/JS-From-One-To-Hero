export default class Likes {
  constructor() {
    this.likes = [];
  }

  addLike(id, title, author, img) {
    const like = { id, title, author, img };
    this.likes.push(like);

    //add to LocalStorage SOS
    this.persistData();
    return like;
  }

  deleteLike(id) {
    const index = this.likes.findIndex((el) => el.id === id);
    this.likes.splice(index, 1);

    //delete to LocalStorage SOS
    this.persistData();
  }

  isLiked(id) {
    return this.likes.findIndex((el) => el.id === id) !== -1;
  }

  getNumLikes() {
    return this.likes.length;
  }

  persistData() {
    localStorage.setItem("likes", JSON.stringify(this.likes));
    //Local Storage accepts only Strings
    //so we stringfy the array and when we want it back we convert back to array
  }

  readStorage() {
    const storage = JSON.parse(localStorage.getItem("likes"));
    //restore likes from the storage
    if (storage) {
      this.likes = storage;
    }
  }
}
