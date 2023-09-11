import React from 'react'
import SettingsInput from './SettingsInput'

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
                      <label htmlFor="searchAPIUrl" className="text-white">
                        Search API Integration URL
                      </label>
                      <SettingsInput
                        storageKey="arc.custom_embed.searchApi"
                        defaultValue="https://d2o92lg4k51qh.cloudfront.net/audioSearchApi.html"
                        name='searchAPIUrl'
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="lastName" className="text-white">
                        Load Timeout Msec
                      </label>
                      <SettingsInput
                        storageKey="arc.custom_embed.searchApiTimeout"
                        defaultValue="500"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-9 mb-3">
                      <label htmlFor="viewAPIUrl" className="text-white">
                        View API Integration URL
                      </label>
                      <SettingsInput
                        storageKey="arc.custom_embed.viewApi"
                        defaultValue="https://d2o92lg4k51qh.cloudfront.net/audioViewApi.html"
                        name="viewAPIUrl"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="lastName" className="text-white">
                        Load Timeout Msec
                      </label>
                      <SettingsInput
                        storageKey="arc.custom_embed.viewApiTimeout"
                        defaultValue="500"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-9 mb-3">
                      <label htmlFor="editAPIUrl" className="text-white">
                        Edit API Integration URL
                      </label>
                      <SettingsInput
                        storageKey="arc.custom_embed.editApi"
                        defaultValue="https://d2o92lg4k51qh.cloudfront.net/audioEditApi.html"
                        name="editAPIUrl"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="lastName" className="text-white">
                        Load Timeout Msec
                      </label>
                      <SettingsInput
                        storageKey="arc.custom_embed.editApiTimeout"
                        defaultValue="500"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-9 mb-3">
                      <label htmlFor="firstName" className="text-white">
                        Host Load Timeout Msec
                      </label>
                      <SettingsInput
                        storageKey="arc.custom_embed.hostLoadTimeout"
                        defaultValue="6000"
                      />
                    </div>
                  </div>
                </form>
              </div>
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
