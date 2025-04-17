class Hash {
  info() {
    const hash = location.hash.split('/');
    return { id: hash[1] };
  }

  setInfo(info) {
    location.hash = '#!/' + info.id;
  }

  isLooking(id) {
    return id !== undefined && id === this.info().id;
  }

  toggleLookingFor(id) {
    const info = { id: (this.isLooking(id) ? '' : id) };
    this.setInfo(info);
  }
}

export default new Hash();
