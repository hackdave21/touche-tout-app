// === CONFIG ===
    const SHOP = {
      brand: 'Touche‑Tout',
      currency: 'XOF',
      whatsappPhone: '22893617132', 
      messageHeader: 'Nouvelle commande depuis Touche‑Tout',
      categories: ['Tous','Électronique','Automobile','Maison','Beauté'],
      products: [
        {id:'mxq-pro', name:'Box Android TV – MXQ Pro 5G', price: 25000, cat:'Électronique', image:'https://images.unsplash.com/photo-1593359677879-88e151a76da5?q=80&w=800&auto=format&fit=crop'},
        {id:'rose-lampe', name:'Lampe solaire rose multicolore (x2)', price: 6000, cat:'Maison', image:'https://images.unsplash.com/photo-1593167481018-c6d32fc19489?q=80&w=800&auto=format&fit=crop'},
        {id:'anti-goudron', name:'Anti-goudron pour fumeurs – 30ml', price: 4500, cat:'Beauté', image:'https://images.unsplash.com/photo-1535914254981-b5012eebbd15?q=80&w=800&auto=format&fit=crop'},
        {id:'libertex', name:'Crème Libertex – soin raffermissant', price: 12000, cat:'Beauté', image:'https://images.unsplash.com/photo-1604908176997-431b43d9f140?q=80&w=800&auto=format&fit=crop'},
        {id:'dashcam', name:'Dashcam Full HD – Grand angle', price: 19500, cat:'Automobile', image:'https://images.unsplash.com/photo-1516873240891-4bf0140b3e88?q=80&w=800&auto=format&fit=crop'},
        {id:'chargeur-auto', name:'Chargeur voiture 2xUSB 36W', price: 5500, cat:'Automobile', image:'https://images.unsplash.com/photo-1593941707882-a5bba14938c3?q=80&w=800&auto=format&fit=crop'},
        {id:'powerbank', name:'Powerbank 20 000 mAh', price: 15000, cat:'Électronique', image:'https://images.unsplash.com/photo-1611175694989-d2b97c5b43da?q=80&w=800&auto=format&fit=crop'},
        {id:'ampoule-led', name:'Ampoule LED E27 – 12W', price: 1200, cat:'Maison', image:'https://images.unsplash.com/photo-1484887609840-0b745c1b4ca7?q=80&w=800&auto=format&fit=crop'}
      ]
    }

    // Utils
    const fmt = new Intl.NumberFormat('fr-FR', {style:'currency', currency: SHOP.currency});
    const el = sel => document.querySelector(sel);
    const els = sel => [...document.querySelectorAll(sel)];
    const routeLinks = els('[data-route]');

    // routes
    const routes = {
      '#/': 'page-home',
      '#/boutique': 'page-shop',
      '#/apropos': 'page-about',
      '#/contact': 'page-contact'
    }
    const activateRoute = ()=>{
      const hash = location.hash || '#/';
      routeLinks.forEach(a=> a.classList.toggle('active', a.getAttribute('href')===hash));
      Object.values(routes).forEach(id=> el('#'+id).classList.remove('active'));
      const pageId = routes[hash] || 'page-home';
      el('#'+pageId).classList.add('active');
      window.scrollTo({top:0, behavior:'smooth'});
    }
    window.addEventListener('hashchange', activateRoute);

    // State Panier (localStorage)
    const CART_KEY = 'shop_cart_v1';
    let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    const saveCart = ()=> localStorage.setItem(CART_KEY, JSON.stringify(cart));

    // Catalogue rendering with category + search
    const $catalogue = el('#catalogue');
    const $catFilters = el('#catFilters');
    let currentCat = 'Tous';

    const renderCats = ()=>{
      $catFilters.innerHTML = SHOP.categories.map(c=>`<button data-cat="${c}" class="${c===currentCat?'active':''}">${c}</button>`).join('');
      els('#catFilters button').forEach(b=> b.addEventListener('click', ()=>{ currentCat=b.dataset.cat; renderCats(); renderCatalogue(el('#search').value); }));
    }

    const renderCatalogue = (filter='')=>{
      const f = (filter||'').trim().toLowerCase();
      const items = SHOP.products
        .filter(p => (currentCat==='Tous' || p.cat===currentCat))
        .filter(p => p.name.toLowerCase().includes(f));
      $catalogue.innerHTML = items.map(p => `
        <article class="card fade-in">
          <img src="${p.image}" alt="${p.name}">
          <div class="card-body">
            <div class="title">${p.name}</div>
            <div class="meta"><span class="cat-name">${p.cat}</span> · <span class="stock">En stock</span></div>
            <div class="price">${fmt.format(p.price)}</div>
            <button class="btn add" data-id="${p.id}">Ajouter</button>
          </div>
        </article>
      `).join('');
      els('.add').forEach(b=> b.addEventListener('click', ()=> addToCart(b.dataset.id)));
    }

    // Panier helpers
    const getItem = id => SHOP.products.find(p=>p.id===id);
    const addToCart = id => {
      const idx = cart.findIndex(i=>i.id===id);
      if(idx>-1) cart[idx].qty += 1; else cart.push({id, qty:1});
      saveCart();
      renderCart();
      openDrawer();
    }
    const removeFromCart = id => { cart = cart.filter(i=>i.id!==id); saveCart(); renderCart(); }
    const setQty = (id, qty)=>{ const item = cart.find(i=>i.id===id); if(!item) return; item.qty = Math.max(1, qty|0); saveCart(); renderCart(); }

    const totals = ()=>{
      const subtotal = cart.reduce((s,i)=> s + getItem(i.id).price * i.qty, 0);
      return { subtotal, total: subtotal } // livraison à confirmer
    }

    const renderCart = ()=>{
      el('#cartCount').textContent = cart.reduce((s,i)=> s+i.qty, 0);
      const $items = el('#cartItems');
      if(cart.length===0){
        $items.innerHTML = `<div class="muted">Votre panier est vide.</div>`;
        el('#subtotal').textContent = fmt.format(0);
        el('#total').textContent = fmt.format(0);
        return;
      }
      $items.innerHTML = cart.map(i=>{
        const p = getItem(i.id);
        const line = p.price * i.qty;
        return `
          <div class="cart-item fade-in">
            <img src="${p.image}" alt="${p.name}" style="width:64px;height:64px;object-fit:cover;border-radius:10px">
            <div>
              <div style="font-weight:800">${p.name}</div>
              <div class="muted">${fmt.format(p.price)} × ${i.qty} = <strong>${fmt.format(line)}</strong></div>
              <div class="qty" style="margin-top:6px">
                <button aria-label="Moins" data-act="dec" data-id="${i.id}">−</button>
                <input value="${i.qty}" data-id="${i.id}" />
                <button aria-label="Plus" data-act="inc" data-id="${i.id}">+</button>
              </div>
            </div>
            <button class="btn danger" data-act="del" data-id="${i.id}">Suppr.</button>
          </div>
        `
      }).join('');
      const t = totals();
      el('#subtotal').textContent = fmt.format(t.subtotal);
      el('#total').textContent = fmt.format(t.total);

      // bind actions
      els('.cart-item button').forEach(b=>{
        const id = b.dataset.id; const act = b.dataset.act;
        if(act==='del') b.onclick = ()=> removeFromCart(id);
        if(act==='inc') b.onclick = ()=> setQty(id, (cart.find(i=>i.id===id)?.qty||1)+1);
        if(act==='dec') b.onclick = ()=> setQty(id, (cart.find(i=>i.id===id)?.qty||1)-1);
      });
      els('.cart-item input').forEach(inp=> inp.addEventListener('change', ()=> setQty(inp.dataset.id, parseInt(inp.value||'1',10))));
    }

    // Drawer controls
    const drawer = el('#drawer');
    const openDrawer = ()=> drawer.classList.add('open');
    const closeDrawer = ()=> drawer.classList.remove('open');

    // Search
    el('#search').addEventListener('input', (e)=> renderCatalogue(e.target.value));

    // Header buttons
    el('#openCart').addEventListener('click', openDrawer);
    el('#closeCart').addEventListener('click', closeDrawer);
    el('#clearCart').addEventListener('click', ()=>{ cart=[]; saveCart(); renderCart(); });

    // Checkout -> WhatsApp
    el('#checkoutForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      if(cart.length===0){ alert('Votre panier est vide.'); return; }
      const name = el('#c_name').value.trim();
      const phone = el('#c_phone').value.trim();
      const addr = el('#c_address').value.trim();
      const lines = cart.map(i=>{ const p = getItem(i.id); return `• ${p.name} x${i.qty} = ${fmt.format(p.price*i.qty)}` }).join('%0A');
      const t = totals();
      const msg = [
        `*${SHOP.messageHeader}*`,
        `Nom: ${name}`,
        `Téléphone: ${phone}`,
        addr?`Adresse: ${addr}`:null,
        '',
        '*Détails de la commande*',
        lines,
        `Total: ${fmt.format(t.total)}`,
        '',
        'Mode de paiement: À convenir',
      ].filter(Boolean).join('%0A');
      const url = `https://wa.me/${SHOP.whatsappPhone}?text=${msg}`;
      window.open(url, '_blank');
    });

    // Contact -> WhatsApp
    el('#contactForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const n=el('#ct_name').value.trim();
      const p=el('#ct_phone').value.trim();
      const s=(el('#ct_subject').value||'Demande').trim();
      const m=(el('#ct_message').value||'').trim();
      const msg = encodeURIComponent(`*Contact ${SHOP.brand}*
Nom: ${n}
Téléphone: ${p}
Sujet: ${s}

${m}`);
      window.open(`https://wa.me/${SHOP.whatsappPhone}?text=${msg}`,'_blank');
    });

    // Thème clair/sombre
    const applyTheme = (t)=>{
      document.documentElement.setAttribute('data-theme', t);
      const btn = document.getElementById('themeToggle');
      if(btn){ btn.textContent = t==='light' ? '☀️' : '🌙'; }
      localStorage.setItem('theme', t);
    }
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(currentTheme);
    document.getElementById('themeToggle')?.addEventListener('click', ()=>{
      applyTheme(document.documentElement.getAttribute('data-theme')==='light' ? 'dark' : 'light');
    });

    // Init
    renderCats();
    renderCatalogue('');
    renderCart();
    activateRoute();
    el('#year').textContent = new Date().getFullYear();
      // Newsletter (frontend uniquement)
    const nlBtn = document.getElementById('nl_btn');
    if(nlBtn){
      nlBtn.addEventListener('click', ()=>{
        const v = (document.getElementById('nl_email').value||'').trim();
        if(!v){ alert('Entrez votre e‑mail.'); return; }
        alert('Merci ! Nous vous tiendrons informé(e) des offres.');
        document.getElementById('nl_email').value='';
      });
    }
