import React from 'react'

export default function Header() {
  return (
    <header>
      <div className="collapse bg-dark" id="navbarHeader">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 col-md-11 py-4">
              <div className="col-md-12 order-md-1">
                <h4 className="mb-3 text-white">Settings</h4>
                <form className="needs-validation">
                  <div className="row">
                    <div className="col-md-9 mb-3">
                      <label htmlFor="firstName" className="text-white">
                        Search API Integration URL
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        placeholder=""
                        value=""
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="lastName" className="text-white">
                        Load Timeout
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        placeholder=""
                        value=""
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>
              {/** */}
            </div>
          </div>
        </div>
      </div>
      <div className="navbar navbar-dark bg-dark box-shadow">
        <div className="container d-flex justify-content-between">
          <a href="#" className="navbar-brand d-flex align-items-center">
            <strong>Custom Embed Plugin Host Application</strong>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarHeader"
            aria-controls="navbarHeader"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
        </div>
      </div>
    </header>
  )
}
