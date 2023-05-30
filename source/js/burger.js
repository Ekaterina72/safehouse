const burgerMenu = document.querySelector('[data-menu]') || null;
const burgerButton = document.querySelector('[data-burger-button]') || null;

const initBurger = () => {
  if (burgerMenu && burgerButton) {
    burgerButton.addEventListener('click', () => {
      burgerMenu.classList.contains('header__menu--open') ? burgerMenu.classList.remove('header__menu--open') : burgerMenu.classList.add('header__menu--open');
      burgerButton.classList.contains('header__menu-button--open') ? burgerButton.classList.remove('header__menu-button--open') : burgerButton.classList.add('header__menu-button--open');
      document.body.style.overflow = 'hidden';
    });

  }
};

initBurger();
